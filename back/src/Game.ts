import config from './config';
import Snake from './entities/Snake';
import { Server, Socket } from 'socket.io';
import axios from 'axios';
import Food from './entities/Food';
import GameEntity from './entities/GameEntity';
import * as shortid from 'shortid';

const schemapack = require('schemapack');
const simplify = require('simplify-js');

const gameUpdate = schemapack.build({
  snakes: [
    {
      id: 'string',
      x: 'int16',
      y: 'int16',
      isBlinking: 'bool',
      isSpeedUp: 'bool',
      length: 'uint16',
      scale: 'float32',
      fillColor: 'string',
      username: 'string',
      angle: 'float32',
      points: [
        {
          x: 'int16',
          y: 'int16',
        },
      ],
      width: 'float32',
    },
  ],
  foods: [
    {
      id: 'string',
      x: 'int16',
      y: 'int16',
      width: 'float32',
      height: 'float32',
    },
  ],
});

const {
  MAP_HEIGHT,
  MAP_RECT_HEIGHT,
  MAP_RECT_WIDTH,
  MAP_WIDTH,
  SOCKET_PORT,
  GAMELOOP_RATE,
  INITIAL_FOOD_COUNT,
  INITIAL_FOOD_VALUE,
  ORCHESTRATOR_URL,
  ORCHESTRATOR_SECRET,
} = config;

const collision = (
  dom: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  },
  dom2: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  },
  isRect?: boolean,
): boolean => {
  const disX = dom.x - dom2.x;
  const disY = dom.y - dom2.y;
  const dw = dom.width + dom2.width;

  if (Math.abs(disX) > dw || Math.abs(disY) > dom.height + dom2.height) {
    return false;
  }

  return isRect ? true : Math.hypot(disX, disY) < dw / 2;
};

// Map class
export class Game {
  public snakes: Snake[];
  public count: number;
  public foods: Food[];

  constructor(
    private wss: Server,
    public width: number = MAP_WIDTH,
    public height = MAP_HEIGHT,
  ) {
    this.snakes = [];
    this.count = 0;
    this.foods = [];
    for (let i = 0; i < INITIAL_FOOD_COUNT; i += 1) {
      this.foods.push(
        new Food({
          id: shortid.generate(),
          x: ~~(Math.random() * (MAP_WIDTH - 100) + 100 / 2),
          y: ~~(Math.random() * (MAP_HEIGHT - 100) + 100 / 2),
          size: 10,
          value: INITIAL_FOOD_VALUE,
        }),
      );
    }
  }

  private confirmConnection() {
    axios.get(
      `http://${ORCHESTRATOR_URL}/confirm/${process.env.EB_SERVER_ID}`,
      {
        auth: {
          username: '',
          password: ORCHESTRATOR_SECRET,
        },
        withCredentials: true,
      },
    );
  }

  private disconnect() {
    axios.get(
      `http://${ORCHESTRATOR_URL}/disconnect/${process.env.EB_SERVER_ID}`,
    );
  }

  public init() {
    this.wss.listen(SOCKET_PORT);
    setInterval(() => this.run(), GAMELOOP_RATE);

    this.wss.on('connection', (ws: Socket) => {
      this.confirmConnection();

      let currentPlayer: Snake;

      ws.on('register', (username: string) => {
        currentPlayer = new Snake({
          username,
          id: shortid.generate(),
          size: 30,
          length: 280,
          angle: Math.random() * 2 * Math.PI,
          x: ~~(Math.random() * (MAP_WIDTH - 100) + 100 / 2),
          y: ~~(Math.random() * (MAP_HEIGHT - 100) + 100 / 2),
        });
        this.snakes.push(currentPlayer);
        ws.emit('register-success', currentPlayer);
      });

      ws.on('move', (orientation: any) => {
        if (currentPlayer) currentPlayer.moveTo(orientation.x, orientation.y);
      });

      ws.on('player-speed-up', () => {
        currentPlayer.speedUp();
      });

      ws.on('player-speed-down', () => {
        currentPlayer.speedDown();
      });

      ws.on('disconnect', () => {
        if (currentPlayer) {
          const idx = this.snakes.findIndex(
            snake => snake.id === currentPlayer.id,
          );
          if (idx !== -1) {
            // handle the ctrl+R refresh case
            this.snakes.splice(idx, 1);
            currentPlayer = undefined;
          }
        }
        this.disconnect();
      });
    });
  }

  private run() {
    const snakeDeleted: Map<string, Snake> = new Map();

    this.snakes.forEach((snake: Snake) => {
      snake.update();

      if (snake.length < 0) {
        snakeDeleted.set(snake.id, snake);
        return;
      }

      this.snakes.forEach((snake2: Snake) => {
        snake2.points.forEach((point: { x: number; y: number }) => {
          if (
            snake2.id !== snake.id &&
            collision(snake, {
              ...point,
              width: snake2.width,
              height: snake2.height,
            })
          ) {
            if (!snakeDeleted.has(snake.id)) {
              snakeDeleted.set(snake.id, snake);
            }
          }
        });
      });

      this.foods.forEach((food: Food) => {
        food.update();
        if (!collision(snake, food)) {
          return;
        }
        const added = snake.eat(food);
        this.foods.splice(this.foods.indexOf(food), 1);

        const newScale = snake.scale + added / (snake.width * 4);
        if (newScale < 1.4) {
          snake.scale = newScale;
        }
      });

      const diff = INITIAL_FOOD_COUNT / 2 - this.foods.length;

      for (let i = 0; i < diff; i += 1) {
        this.foods.push(
          new Food({
            id: shortid.generate(),
            x: ~~(Math.random() * (MAP_WIDTH - 100) + 100 / 2),
            y: ~~(Math.random() * (MAP_HEIGHT - 100) + 100 / 2),
            size: 10,
            value: INITIAL_FOOD_VALUE,
          }),
        );
      }

      this.limit(snake);
    });

    snakeDeleted.forEach((snake: Snake) => {
      this.snakes.splice(this.snakes.indexOf(snake), 1);
      snake.points.forEach(
        (point, index) =>
          index % 10 === 0 &&
          this.foods.push(
            new Food({
              id: shortid.generate(),
              x: point.x,
              y: point.y,
              size: 10,
              value: INITIAL_FOOD_VALUE,
            }),
          ),
      );
    });

    this.wss.emit(
      'game-update',
      gameUpdate.encode({
        // snakes: this.snakes.map((snake: Snake) => {
        //   return {
        //     ...snake,
        //     points:
        //       snake.points.length < 20
        //         ? snake.points
        //         : snake.points.filter((point, index) => index % 10 === 0),
        //   };
        // }),
        snakes: this.snakes.map((snake: Snake) => {
          return {
            ...snake,
            points: simplify(snake.points, 5),
          };
        }),
        foods: this.foods,
      }),
    );
  }

  // limit element, prevent it moving to outside
  public limit(element: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  }): void {
    const whalf: number = (element.width || 1) / 2;
    if (element.x < whalf) {
      element.x = whalf;
    } else if (element.x + whalf > this.width) {
      element.x = this.width - whalf;
    }

    const hhalf: number = (element.height || 1) / 2;
    if (element.y < hhalf) {
      element.y = hhalf;
    } else if (element.y + hhalf > this.height) {
      element.y = this.height - hhalf;
    }
  }
}
