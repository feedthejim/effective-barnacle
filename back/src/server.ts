import * as WebSocket from 'ws';

class Server extends WebSocket.Server {
  public broadcast(data: any): void {
    this.clients.forEach((client: WebSocket) => {
      client.send(data);
    });
  }
}

const wss = new Server({ port: 4242 });

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

wss.on('connection', (ws: WebSocket) => {
  ws.on('move', (angle: Coord) => {
    ws.send(`Hello, you sent -> ${angle}`);
  });
  ws.send('Hi there, I am a WebSocket server');
});

setInterval(gameLoop, 50);
