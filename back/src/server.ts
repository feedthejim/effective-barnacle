import * as io from 'socket.io';
import { Game } from './Game';

const wss = io();
const game = new Game(wss);
game.init();
