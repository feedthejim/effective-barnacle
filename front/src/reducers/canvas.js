import Konva from 'konva';
import { ADD_COLORED_RECT } from '../actions/canvas';
import {
  WEBSOCKET_GAME_UPDATE,
  WEBSOCKET_CONNECT,
  WEBSOCKET_REGISTER_SUCCESS,
} from '../actions/websocket';

const initialState = {
  isGameRunning: false,
  gameMap: {
    width: window.innerWidth,
    height: window.innerHeight,
    scale: 1,
    paintWidth: window.innerWidth / 1,
    paintHeight: window.innerHeight / 1,
    view: {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    },
  },
  players: [],
  player: {
    username: 'undefined',
    id: -1,
    radius: -1,
    body: [
      {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      },
    ],
    currentOrientation: [],
    color: Konva.Util.getRandomColor(),
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case WEBSOCKET_CONNECT:
      return {
        ...state,
        player: {
          ...state.player,
          username: action.username,
        },
      };
    case WEBSOCKET_REGISTER_SUCCESS:
      return {
        ...state,
        player: {
          ...state.player,
          id: action.id,
        },
      };
    case WEBSOCKET_GAME_UPDATE: {
      const player = action.players.find(snake => snake.id === state.player.id);
      const newConf = player
        ? {
          x:
              player.body[0].x / state.gameMap.scale -
              state.gameMap.view.width / 2,
          y:
              player.body[0].y / state.gameMap.scale -
              state.gameMap.view.height / 2,
        }
        : { x: 0, y: 0 };
      return {
        ...state,
        gameMap: {
          ...state.gameMap,
          view: {
            ...state.gameMap.view,
            ...newConf,
          },
        },
        isGameRunning: true,
        players: [...action.players],
        player: {
          ...state.player,
          body: player ? player.body : [],
        },
      };
    }
    case ADD_COLORED_RECT:
      return {
        ...state,
        entities: [
          ...state.entities,
          {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            color: Konva.Util.getRandomColor(),
          },
        ],
      };
  }
  return state;
};