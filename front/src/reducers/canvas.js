import Konva from 'konva'
import { ADD_COLORED_RECT } from '../actions/canvas'
import {
  WEBSOCKET_GAME_UPDATE,
  WEBSOCKET_CONNECT,
  WEBSOCKET_REGISTER_SUCCESS,
} from '../actions/websocket'

export default (
  state = {
    isGameRunning: false,
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
    currentAngle: 0,
  },
  action,
) => {
  switch (action.type) {
    case WEBSOCKET_CONNECT:
      return {
        ...state,
        player: {
          ...state.player,
          username: action.username,
        },
      }
    case WEBSOCKET_REGISTER_SUCCESS:
      return {
        ...state,
        player: {
          ...state.player,
          id: action.id,
        },
      }
    case WEBSOCKET_GAME_UPDATE: {
      const player = action.players.find(snake => snake.id === state.player.id)
      return {
        ...state,
        isGameRunning: true,
        players: [...action.players],
        player: {
          ...state.player,
          body: player.body,
        },
      }
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
      }
  }
  return state
}
