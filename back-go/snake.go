package main

import (
	"math"
	"math/rand"

	"github.com/teris-io/shortid"
)

type Point struct {
	X float64 `msgpack:"x"`
	Y float64 `msgpack:"y"`
}

type Movement struct {
	Point
	Speed float64
	Angle float64
}

type Rect struct {
	MinX float64 `msgpack:"minX"`
	MinY float64 `msgpack:"minY"`
	MaxX float64 `msgpack:"maxX"`
	MaxY float64 `msgpack:"maxY"`
}

type GameEntity struct {
	Point
	Width  float64 `msgpack:"width"`
	Height float64 `msgpack:"height"`
}

type Snake struct {
	GameEntity
	Id               string  `msgpack:"id"`
	Score            int     `msgpack:"score"`
	IsSpeedUp        bool    `msgpack:"isSpeedUp"`
	FillColor        string  `msgpack:"fillColor"`
	Angle            float64 `msgpack:"angle"`
	Scale            float64 `msgpack:"scale"`
	IsBlinking       bool    `msgpack:"isBlinking"`
	CollisionRect    *Rect   `msgpack:"collisionRect"`
	Username         string  `msgpack:"username"`
	Speed            float64 `msgpack:"speed"`
	Length           float64 `msgpack:"length"`
	FrameCounter     int
	MovementQueue    []*Movement
	OldSpeed         float64
	Stopped          bool
	ToAngle          float64
	TurnSpeed        float64
	Points           []*Point
	SimplifiedPoints []*Point
	MovementQueueLen float64
	Vx               float64
	Vy               float64
}

var tPi = math.Pi * 2
var twoPi = int(tPi)

func NewSnake(username string) *Snake {
	return &Snake{
		GameEntity: GameEntity{
			Point: Point{
				X: math.Ceil(rand.Float64()*(MAP_WIDTH-100) + 100/2),
				Y: math.Ceil(rand.Float64()*(MAP_HEIGHT-100) + 100/2),
			},
			Width:  30,
			Height: 30,
		},
		Id:        shortid.MustGenerate(),
		FillColor: "#000", // FIXME: generate random color
		Angle:     rand.Float64()*float64(twoPi) + BASE_ANGLE,
		ToAngle:   rand.Float64()*float64(twoPi) + BASE_ANGLE,
		Length:    280,
		Username:  username,
		Scale:     INITIAL_SCALE,
		Speed:     SPEED,
		OldSpeed:  SPEED,
		TurnSpeed: 0.15,
		CollisionRect: &Rect{
			MinX: 30000,
			MaxX: -30000,
			MinY: 30000,
			MaxY: -30000,
		},
		MovementQueueLen: math.Ceil(280 / SPEED),
	}
}

func (s *Snake) UpdateSize(added float64) {
	s.Width += added
	s.Height += added
	s.Length += added * 50
	s.TurnSpeed -= added / 1000
	s.TurnSpeed = math.Max(0.05, s.TurnSpeed)
	s.MovementQueueLen = math.Ceil(float64(s.Length) / s.OldSpeed)
}

func (s *Snake) MoveTo(nx, ny float64) {
	x := nx - s.X
	y := s.Y - ny
	angle := math.Atan(math.Abs(x / y))

	if x > 0 && y < 0 {
		angle = math.Pi - angle
	} else if x < 0 && y < 0 {
		angle = math.Pi + angle
	} else if x < 0 && y > 0 {
		angle = math.Pi*2 - angle
	}

	oldAngle := math.Abs(float64(int(s.ToAngle) % twoPi))

	rounds := math.Ceil(s.ToAngle / (math.Pi * 2))

	s.ToAngle = angle

	if oldAngle >= (math.Pi*3)/2 && s.ToAngle <= math.Pi/2 {
		rounds += 1
	} else if oldAngle <= math.Pi/2 && s.ToAngle >= (math.Pi*3)/2 {
		rounds -= 1
	}

	s.ToAngle += rounds * math.Pi * 2
}

func (s *Snake) Velocity() {
	angle := float64(int(s.Angle) % twoPi)
	vx := math.Abs(s.Speed * math.Sin(angle))
	vy := math.Abs(s.Speed * math.Cos(angle))

	if angle < math.Pi/2 {
		s.Vx = vx
		s.Vy = -vy
	} else if angle < math.Pi {
		s.Vx = vx
		s.Vy = vy
	} else if angle < (math.Pi*3)/2 {
		s.Vx = -vx
		s.Vy = vy
	} else {
		s.Vx = -vx
		s.Vy = -vy
	}
}

func Sign(x float64) float64 {
	if x > 0 {
		return 1
	}
	if x < 0 {
		return -1
	}
	return 0
}

func (s *Snake) TurnAround() {
	angleDistance := s.ToAngle - s.Angle

	if math.Abs(angleDistance) <= s.TurnSpeed {
		s.Angle = BASE_ANGLE + float64(int(s.ToAngle)%twoPi)
		s.ToAngle = s.Angle
	} else {
		s.Angle += Sign(angleDistance) * s.TurnSpeed
	}
}

func (s *Snake) SpeedUp() {
	if s.IsSpeedUp {
		return
	}

	s.IsSpeedUp = true
	s.OldSpeed = s.Speed
	s.Speed *= 2
}

func (s *Snake) SpeedDown() {
	if !s.IsSpeedUp {
		return
	}

	s.IsSpeedUp = false
	s.Speed = s.OldSpeed
}

func (s *Snake) Eat(f *Food) float64 {
	s.Score += f.Value

	s.FrameCounter = 10

	added := float64(f.Value / 200)
	s.UpdateSize(added)
	return added
}

func (s *Snake) Blink() {
	s.IsBlinking = !s.IsBlinking
}

func (s *Snake) UpdateCollisionRect() {
	s.SimplifiedPoints = Simplify(s.Points, 5, false)

	s.CollisionRect = &Rect{
		MinX: 3000,
		MaxX: -3000,
		MinY: 3000,
		MaxY: -3000,
	}

	for _, point := range s.SimplifiedPoints {
		if point.X < s.CollisionRect.MinX {
			s.CollisionRect.MinX = point.X
		}
		if point.X > s.CollisionRect.MaxX {
			s.CollisionRect.MaxX = point.X
		}
		if point.Y < s.CollisionRect.MinY {
			s.CollisionRect.MinY = point.Y
		}
		if point.Y > s.CollisionRect.MaxY {
			s.CollisionRect.MaxY = point.Y
		}
	}

	s.CollisionRect.MinX -= s.Width
	s.CollisionRect.MinY -= s.Width
	s.CollisionRect.MaxX += s.Width
	s.CollisionRect.MaxY += s.Width
}

func (s *Snake) Action() {
	if s.Stopped {
		return
	}

	if s.FrameCounter > 0 {
		s.Blink()
		s.FrameCounter -= 1
	} else {
		s.IsBlinking = false
	}

	if s.IsSpeedUp {
		s.Length -= 2
		s.MovementQueueLen -= 2
	}

	s.MovementQueue = append(s.MovementQueue, &Movement{Point{s.X, s.Y}, s.Speed, s.Angle})

	if len(s.MovementQueue) > int(s.MovementQueueLen) {
		s.MovementQueue = s.MovementQueue[1:]
	}

	s.TurnAround()
	s.Velocity()
	s.X += s.Vx
	s.Y += s.Vy

	s.Points = []*Point{}
	wholeLength := s.Length

	mLength := len(s.MovementQueue)
	if mLength > 0 {
		i := mLength - 1
		for i > 0 {
			movement := s.MovementQueue[i]
			x := movement.X
			y := movement.Y
			if wholeLength > 0 && wholeLength < movement.Speed {
				lm := s.MovementQueue[i+1]
				if lm == nil {
					lm = &Movement{Point{s.X, s.Y}, s.Width, s.Height}
				}
				ratio := wholeLength / movement.Speed
				x = lm.X - (lm.X-x)*ratio
				y = lm.Y - (lm.Y-y)*ratio
			} else if wholeLength < 0 {
				break
			}
			i--
			wholeLength -= movement.Speed
			s.Points = append(s.Points, &Point{x, y})
		}
	}
	s.UpdateCollisionRect()
}