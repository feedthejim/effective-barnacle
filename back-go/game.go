package main

import (
	"log"
	"math"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"github.com/vmihailenco/msgpack"
)

type Client struct {
	Snake *Snake
	Conn  *websocket.Conn
}

type Game struct {
	Count   int
	Foods   []*Food
	Width   float64
	Height  float64
	Clients []*Client
	Jobs    chan *Client
}

type Player struct {
	GameEntity
	Id            string   `msgpack:"id"`
	IsSpeedUp     bool     `msgpack:"isSpeedUp"`
	FillColor     string   `msgpack:"fillColor"`
	Angle         float64  `msgpack:"angle"`
	Scale         float64  `msgpack:"scale"`
	IsBlinking    bool     `msgpack:"isBlinking"`
	CollisionRect *Rect    `msgpack:"collisionRect"`
	Username      string   `msgpack:"username"`
	Speed         float64  `msgpack:"speed"`
	Length        float64  `msgpack:"length"`
	Score         int      `msgpack:"score"`
	Points        []*Point `msgpack:"points"`
}

type IncMessage struct {
	Point
	Topic    string
	Username string
}

type MoveMessage struct {
	Topic  string `msgpack:"topic"`
	Player *Snake `msgpack:"player"`
}

type GameUpdateMessage struct {
	Topic  string    `msgpack:"topic"`
	Snakes []*Player `msgpack:"snakes"`
	Foods  []*Food   `msgpack:"foods"`
}

func NewGame() *Game {
	game := &Game{
		Count:   0,
		Foods:   []*Food{},
		Width:   MAP_WIDTH,
		Height:  MAP_HEIGHT,
		Clients: []*Client{},
		Jobs:    make(chan *Client),
	}

	for i := 0; i < INITIAL_FOOD_COUNT; i++ {
		game.Foods = append(game.Foods, NewRandomFood())
	}

	return game
}

func collision(ent1, ent2 *GameEntity, isRect bool) bool {
	disX := ent1.X - ent2.X
	disY := ent1.Y - ent2.Y
	dw := ent1.Width + ent2.Width

	if math.Abs(disX) > dw || math.Abs(disY) > ent1.Height+ent2.Height {
		return false
	}

	if isRect {
		return true
	}

	return math.Hypot(disX, disY) < dw/2
}

func rectCollision(rect1, rect2 *Rect) bool {
	return !(rect2.MinX > rect1.MaxX ||
		rect2.MaxX < rect1.MinX ||
		rect2.MaxY < rect1.MinY ||
		rect2.MinY > rect1.MaxY)
}

func checkCollision(s1, s2 *Snake) bool {
	for _, point := range s2.Points {
		if collision(&s1.GameEntity,
			&GameEntity{
				Point:  Point{point.X, point.Y},
				Width:  s2.Width,
				Height: s2.Height,
			},
			false) {
			return true
		}
	}

	return false
}

func confirmConnection() {
	client := &http.Client{}
	req, _ := http.NewRequest("GET", "http://"+ORCHESTRATOR_URL+"/confirm/"+os.Getenv("EB_SERVER_ID"), nil)
	req.SetBasicAuth("", ORCHESTRATOR_SECRET)
	client.Do(req)
}

func disconnect() {
	client := &http.Client{}
	req, _ := http.NewRequest("GET", "http://"+ORCHESTRATOR_URL+"/disconnect/"+os.Getenv("EB_SERVER_ID"), nil)
	client.Do(req)
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (g *Game) Init() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log.Println("request")

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("request failed", err)
			return
		}

		log.Println("connect")

		confirmConnection()

		var currentPlayer *Client

		for {
			messageType, p, err := conn.ReadMessage()
			if err != nil {
				log.Println("disconnect")
				if currentPlayer != nil {
					idx := FindSnakeIndex(g.Clients, currentPlayer.Snake.Id)
					if idx != -1 {
						g.Clients = append(g.Clients[:idx], g.Clients[idx+1:]...)
						currentPlayer = nil
					}
				}
				conn.Close()
				disconnect()
				return
			}

			var incMsg IncMessage
			err = msgpack.Unmarshal(p, &incMsg)
			if err != nil {
				log.Println("error while decoding msgpack", err)
				return
			}

			switch incMsg.Topic {
			case "register":
				currentPlayer = &Client{
					Snake: NewSnake(incMsg.Username),
					Conn:  conn,
				}
				g.Clients = append(g.Clients, currentPlayer)

				msg, err := msgpack.Marshal(&MoveMessage{
					Topic:  "register-success",
					Player: currentPlayer.Snake,
				})
				if err != nil {
					log.Println("error while encoding msgpack", err)
				}

				err = conn.WriteMessage(messageType, msg)
				if err != nil {
					log.Println("error while writing message", err)
					return
				}
			case "move":
				if currentPlayer != nil {
					currentPlayer.Snake.MoveTo(incMsg.X, incMsg.Y)
				}
			case "player-speed-up":
				currentPlayer.Snake.SpeedUp()
			case "player-speed-down":
				currentPlayer.Snake.SpeedDown()
			default:
				log.Println("error while reading topic")
			}
		}
	})

	ticker := time.NewTicker(16 * time.Millisecond)
	go func() {
		for _ = range ticker.C {
			g.Run()
		}
	}()

	for w := 0; w < 100; w++ {
		go g.Worker()
	}

	port := os.Getenv("EB_SERVER_PORT")
	if port == "" {
		port = "4242"
	}

	log.Println("Serving at localhost:" + port)

	http.ListenAndServe(":"+port, nil)
}

func (g *Game) limit(snake *Snake) {
	whalf := snake.Width
	if whalf == 0 {
		whalf = 1
	}
	whalf /= 2

	if snake.X < whalf {
		snake.X = whalf
	} else if snake.X+whalf > g.Width {
		snake.X = g.Width - whalf
	}

	hhalf := snake.Height
	if hhalf == 0 {
		hhalf = 1
	}
	hhalf /= 2

	if snake.Y < hhalf {
		snake.Y = hhalf
	} else if snake.Y+hhalf > g.Height {
		snake.Y = g.Height - hhalf
	}
}

func FindFoodIndex(foods []*Food, id string) int {
	for i, food := range foods {
		if id == food.Id {
			return i
		}
	}
	return -1
}

func FindSnakeIndex(clients []*Client, id string) int {
	for i, client := range clients {
		if id == client.Snake.Id {
			return i
		}
	}
	return -1
}

func (g *Game) Worker() {
	for client := range g.Jobs {
		g.sendData(*client)
	}
}

func (g *Game) sendData(client Client) {
	snake := client.Snake

	gameUpdateMsg := &GameUpdateMessage{
		Topic:  "game-update",
		Foods:  []*Food{},
		Snakes: []*Player{},
	}

	for _, food := range g.Foods {
		if rectCollision(snake.DisplayRect, food.CollisionRect) {
			gameUpdateMsg.Foods = append(gameUpdateMsg.Foods, food)
		}
	}

	for _, client2 := range g.Clients {
		other := client2.Snake

		if snake.Id != other.Id && !rectCollision(snake.DisplayRect, other.CollisionRect) {
			continue
		}

		gameUpdateMsg.Snakes = append(gameUpdateMsg.Snakes, &Player{
			GameEntity:    other.GameEntity,
			Id:            other.Id,
			IsSpeedUp:     other.IsSpeedUp,
			FillColor:     other.FillColor,
			Angle:         other.Angle,
			Scale:         other.Scale,
			IsBlinking:    other.IsBlinking,
			CollisionRect: other.CollisionRect,
			Username:      other.Username,
			Speed:         other.Speed,
			Length:        other.Length,
			Score:         len(other.Points),
			Points:        other.SimplifiedPoints,
		})
	}

	msg, err := msgpack.Marshal(gameUpdateMsg)
	if err != nil {
		panic(err)
	}

	err = client.Conn.WriteMessage(websocket.BinaryMessage, msg)
	if err != nil {
		log.Println("error while sending message", err)
		return
	}
}

func (g *Game) Run() {
	deletedSnakes := map[string]*Snake{}

	for _, client := range g.Clients {
		snake := client.Snake

		snake.Action()

		if snake.Length < 0 {
			deletedSnakes[snake.Id] = snake
			continue
		}

		for _, client2 := range g.Clients {
			snake2 := client2.Snake
			if snake2.Id != snake.Id &&
				rectCollision(snake.CollisionRect, snake2.CollisionRect) &&
				checkCollision(snake, snake2) &&
				deletedSnakes[snake.Id] == nil {
				deletedSnakes[snake.Id] = snake
			}
		}

		for _, food := range g.Foods {
			food.Action()

			if !collision(&snake.GameEntity, &food.GameEntity, false) {
				continue
			}

			added := snake.Eat(food)
			idx := FindFoodIndex(g.Foods, food.Id)
			g.Foods = append(g.Foods[:idx], g.Foods[idx+1:]...)

			newScale := snake.Scale + added/(snake.Width*4)
			if newScale < 1.4 {
				snake.Scale = newScale
			}
		}

		diff := INITIAL_FOOD_COUNT/2 - len(g.Foods)
		for i := 0; i < diff; i++ {
			g.Foods = append(g.Foods, NewRandomFood())
		}

		g.limit(snake)
	}

	for _, snake := range deletedSnakes {
		idx := FindSnakeIndex(g.Clients, snake.Id)
		g.Clients = append(g.Clients[:idx], g.Clients[idx+1:]...)
		for i, point := range snake.Points {
			if i%10 == 0 {
				g.Foods = append(g.Foods, NewFood(point.X, point.Y))
			}
		}
	}

	for _, client := range g.Clients {
		g.Jobs <- client
	}
}
