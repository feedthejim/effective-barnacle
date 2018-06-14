package main

import "os"
import "math"

const (
	MAP_WIDTH          = 3000
	MAP_HEIGHT         = 3000
	SPEED              = 5
	BASE_ANGLE         = math.Pi * 200
	GAMELOOP_RATE      = 16
	MAP_RECT_HEIGHT    = 150
	MAP_RECT_WIDTH     = 150
	INITIAL_FOOD_COUNT = 250
	INITIAL_FOOD_VALUE = 120
	INITIAL_SCALE      = 1
)

var (
	SOCKET_PORT         = os.Getenv("EB_SERVER_PORT")
	ORCHESTRATOR_URL    = os.Getenv("EB_ORCHESTRATOR_URL")
	ORCHESTRATOR_SECRET = os.Getenv("EB_ORCHESTRATOR_SECRET")
)
