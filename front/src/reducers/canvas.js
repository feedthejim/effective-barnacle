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
    width: 1500,
    height: 1500,
    scale: 1,
    paintWidth: 1500 / 1,
    paintHeight: 1500 / 1,
    view: {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    },
  },
  players: [],
  foods: [],
  player: {
    username: 'undefined',
    id: -1,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
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
          ...action.player,
        },
        isGameRunning: true,
      };

    case WEBSOCKET_GAME_UPDATE: {
      const player = action.players.find(snake => snake.id === state.player.id);
      
      const newConf = player
        ? {
          x: player.x / state.gameMap.scale - state.gameMap.view.width / 2,
          y: player.y / state.gameMap.scale - state.gameMap.view.height / 2,
        }
        : { x: 0, y: 0 };

      const newScale = player
        ? {
          scale: player.scale,
          paintWidth: 1500 / player.scale,
          paintHeight: 1500 / player.scale,
        }
        : {};

      return {
        ...state,
        gameMap: {
          ...state.gameMap,
          ...newScale,
          view: {
            ...state.gameMap.view,
            ...newConf,
          },
        },
        foods: [...action.foods],
        players: [...action.players],
        player: {
          color: state.player.color,
          ...(player ? player : state.player),
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

    default:
      return state;
  }
};
