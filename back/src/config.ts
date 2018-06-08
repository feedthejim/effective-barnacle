export default {
  MAP_WIDTH: 1500,
  MAP_HEIGHT: 1500,

  SOCKET_PORT: process.env.EB_SERVER_PORT || 4242,
  SPEED: 5,
  BASE_ANGLE: Math.PI * 200,

  GAMELOOP_RATE: 16,
  MAP_RECT_WIDTH: 150,
  MAP_RECT_HEIGHT: 150,

  INITIAL_FOOD_COUNT: 100,
  INITIAL_FOOD_VALUE: 150,
  INITIAL_SCALE: 1,

  ORCHESTRATOR_URL: process.env.EB_ORCHESTRATOR_URL || 'localhost:9000',
  ORCHESTRATOR_SECRET: process.env.EB_ORCHESTRATOR_SECRET || 'secret',
};
