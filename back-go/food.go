package main

import (
	"math"
	"math/rand"

	"github.com/teris-io/shortid"
)

type Food struct {
	GameEntity
	Id             string `msgpack:"id"`
	Value          int
	LightSize      float64
	LightDirection bool
}

func NewFood(x, y float64) *Food {
	return &Food{
		GameEntity: GameEntity{
			Point: Point{
				X: x,
				Y: y,
			},
			Width:  10,
			Height: 10,
		},
		Id:             shortid.MustGenerate(),
		Value:          INITIAL_FOOD_VALUE,
		LightSize:      10,
		LightDirection: true,
	}
}

func NewRandomFood() *Food {
	return NewFood(math.Ceil(rand.Float64()*(MAP_WIDTH-100)+100/2),
		math.Ceil(rand.Float64()*(MAP_HEIGHT-100)+100/2))
}

func (f *Food) Action() {
	lightSpeed := 1.0

	if f.LightDirection {
		f.LightSize += lightSpeed
	} else {
		f.LightSize -= lightSpeed
	}

	if f.LightSize > f.Width || f.LightSize < f.Width/2 {
		f.LightDirection = !f.LightDirection
	}
}
