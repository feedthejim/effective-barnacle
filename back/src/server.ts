import * as io from 'socket.io';

// class Server extends WebSocket.Server {
//   public broadcast(data: any): void {
//     this.clients.forEach((client: WebSocket) => {
//       client.send(data);
//     });
//   }
// }

const wss = io();

declare interface Coord {
  x: number;
  y: number;
}

class Snake {
  public body: Coord[] = [];
}

const snakes = [];
const leaderboard = [];
const sockets = {};

function gameLoop(): void {
}

wss.on('connection', (ws: io.Socket) => {
  ws.on('message', (angle: Coord) => {
    ws.send(`Hello, you sent -> ${angle}`);
  });

  ws.on('register', (username: string) => {
    ws.emit('register-success', Math.random() * 1000);
  });
  ws.send('Hi there, I am a WebSocket server');
});

setInterval(gameLoop, 50);
wss.listen(4242);
