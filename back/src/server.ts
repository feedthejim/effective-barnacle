import * as io from 'socket.io'

// class Server extends WebSocket.Server {
//   public broadcast(data: any): void {
//     this.clients.forEach((client: WebSocket) => {
//       client.send(data);
//     });
//   }
// }

const wss = io()
interface Point {
  x: number
  y: number
}

interface SnakeInput {
  angle: Point
}

const getRndInteger = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

class Snake {
  public id: number
  public body: Point[] = []
  public currentOrientation: Point
  public radius: number

  constructor() {
    this.currentOrientation = { x: 0, y: 0 } // fixme: start looking at north
    this.id = getRndInteger(0, 100)
    this.radius = 1
    this.body = [
      {
        x: getRndInteger(500, 1000),
        y: getRndInteger(500, 1000),
      },
    ]
  }
}

const snakes: Snake[] = []
const leaderboard = []
const sockets = {}

const gameLoop = (): void => {
  snakes.forEach((snake: Snake) => {
    // fixme: update all nodes of the snake
    // snake.body[0].x += snake.currentOrientation.x
    // snake.body[0].y += snake.currentOrientation.y
    snake.body[0].x += getRndInteger(-5, 5)
    snake.body[0].y += getRndInteger(-5, 5)
  })
  wss.emit('game-update', snakes)
}

wss.on('connection', (ws: io.Socket) => {
  let currentPlayer: Snake

  ws.on('register', (username: string) => {
    currentPlayer = new Snake()
    // for (let i = 0; i < 1000; i++) {
    //   snakes.push(new Snake())
    // }
    snakes.push(currentPlayer)
    ws.emit('register-success', currentPlayer.id)
  })

  ws.on('play', (orientation: Point) => {
    currentPlayer.currentOrientation = orientation
  })

  ws.send('Hi there, I am a WebSocket server')
})

setInterval(gameLoop, 50)
wss.listen(process.argv[2])
