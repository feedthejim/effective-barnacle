import config from './config';
import Snake from './entities/Snake';
import { Server, Socket } from 'socket.io';

const {
  MAP_HEIGHT,
  MAP_RECT_HEIGHT,
  MAP_RECT_WIDTH,
  MAP_WIDTH,
  SOCKET_PORT,
  GAMELOOP_RATE,
} = config;
// Map class
export class Game {
  public snakes: Snake[];
  public count: number;

  constructor(
    private wss: Server,
    public width: number = MAP_WIDTH,
    public height = MAP_HEIGHT,
  ) {
    this.snakes = [];
    this.count = 0;
  }

  public init() {
    this.wss.listen(SOCKET_PORT);
    setInterval(() => this.run(), GAMELOOP_RATE);

    this.wss.on('connection', (ws: Socket) => {
      let currentPlayer: Snake;

      ws.on('register', (username: string) => {
        currentPlayer = new Snake({
          id: this.snakes.length,
          size: 30,
          length: 280,
          angle: Math.random() * 2 * Math.PI,
          x: ~~(Math.random() * (MAP_WIDTH - 100) + 100 / 2),
          y: ~~(Math.random() * (MAP_HEIGHT - 100) + 100 / 2),
        });
        // for (let i = 0; i < 1000; i++) {
        //   snakes.push(new Snake())
        // }
        this.snakes.push(currentPlayer);
        ws.emit('register-success', currentPlayer);
      });

      ws.on('move', (orientation: any) => {
        if (currentPlayer) currentPlayer.moveTo(orientation.x, orientation.y);
      });
    });
  }

  private run() {
    this.snakes.forEach((snake: Snake) => {
      snake.update();
      this.limit(snake);
    });
    this.wss.emit('game-update', this.snakes);
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
