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

type Game struct {
	Snakes      []*Snake
	Count       int
	Foods       []*Food
	Width       float64
	Height      float64
	Connections map[*websocket.Conn]bool
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
		Snakes:      []*Snake{},
		Count:       0,
		Foods:       []*Food{},
		Width:       MAP_WIDTH,
		Height:      MAP_HEIGHT,
		Connections: map[*websocket.Conn]bool{},
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

func rectCollision(s1, s2 *Snake) bool {
	rect1 := s1.CollisionRect
	rect2 := s2.CollisionRect

	return !(rect2.MinX > rect1.MaxX ||
		rect2.MaxX < rect1.MinX ||
		rect2.MaxY < rect1.MinY ||
		rect2.MinY > rect1.MaxY)
}

func checkCollision(s1, s2 *Snake) bool {
	for _, point := range s2.Points {
		if collision(&s1.GameEntity,
			&GameEntity{Point{point.X, point.Y}, s2.Width, s2.Height},
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

		g.Connections[conn] = true

		confirmConnection()

		var currentPlayer *Snake

		for {
			messageType, p, err := conn.ReadMessage()
			if err != nil {
				log.Println("disconnect")
				if currentPlayer != nil {
					idx := FindSnakeIndex(g.Snakes, currentPlayer.Id)
					if idx != -1 {
						g.Snakes = append(g.Snakes[:idx], g.Snakes[idx+1:]...)
						currentPlayer = nil
					}
				}
				delete(g.Connections, conn)
				conn.Close()
				disconnect()
				return
			}

			var incMsg IncMessage
			err = msgpack.Unmarshal(p, &incMsg)
			if err != nil {
				log.Println("error while decoding msgpack")
				return
			}

			switch incMsg.Topic {
			case "register":
				currentPlayer = NewSnake(incMsg.Username)
				g.Snakes = append(g.Snakes, currentPlayer)

				msg, err := msgpack.Marshal(&MoveMessage{
					Topic:  "register-success",
					Player: currentPlayer,
				})
				if err != nil {
					log.Println("error while encoding msgpack")
				}

				err = conn.WriteMessage(messageType, msg)
				if err != nil {
					log.Println("error while writing message")
					return
				}
			case "move":
				if currentPlayer != nil {
					currentPlayer.MoveTo(incMsg.X, incMsg.Y)
				}
			case "player-speed-up":
				currentPlayer.SpeedUp()
			case "player-speed-down":
				currentPlayer.SpeedDown()
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

func FindSnakeIndex(snakes []*Snake, id string) int {
	for i, snake := range snakes {
		if id == snake.Id {
			return i
		}
	}
	return -1
}

func (g *Game) Run() {
	deletedSnakes := map[string]*Snake{}

	for _, snake := range g.Snakes {
		snake.Action()

		if snake.Length < 0 {
			deletedSnakes[snake.Id] = snake
			continue
		}

		for _, snake2 := range g.Snakes {
			if snake2.Id != snake.Id &&
				rectCollision(snake, snake2) &&
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
		idx := FindSnakeIndex(g.Snakes, snake.Id)
		g.Snakes = append(g.Snakes[:idx], g.Snakes[idx+1:]...)
		for i, point := range snake.Points {
			if i%10 == 0 {
				g.Foods = append(g.Foods, NewFood(point.X, point.Y))
			}
		}
	}

	gameUpdateMsg := &GameUpdateMessage{
		Topic:  "game-update",
		Foods:  g.Foods,
		Snakes: []*Player{},
	}
	for _, snake := range g.Snakes {
		gameUpdateMsg.Snakes = append(gameUpdateMsg.Snakes, &Player{
			GameEntity:    snake.GameEntity,
			Id:            snake.Id,
			IsSpeedUp:     snake.IsSpeedUp,
			FillColor:     snake.FillColor,
			Angle:         snake.Angle,
			Scale:         snake.Scale,
			IsBlinking:    snake.IsBlinking,
			CollisionRect: snake.CollisionRect,
			Username:      snake.Username,
			Speed:         snake.Speed,
			Length:        snake.Length,
			Score:         len(snake.Points),
			Points:        snake.SimplifiedPoints,
		})
	}
	msg, err := msgpack.Marshal(gameUpdateMsg)
	if err != nil {
		panic(err)
	}

	for conn, _ := range g.Connections {
		err = conn.WriteMessage(websocket.BinaryMessage, msg)
		if err != nil {
			log.Println("error while broadcasting message")
			return
		}
	}
}
