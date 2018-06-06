export const WEBSOCKET_CONNECT = 'WEBSOCKET_CONNECT';
export const WEBSOCKET_CANCEL = 'WEBSOCKET_CANCEL';
export const WEBSOCKET_REGISTER_SUCCESS = 'WEBSOCKET_REGISTER_SUCCESS';
export const WEBSOCKET_GAME_UPDATE = 'WEBSOCKET_GAME_UPDATE';

export const connectToServer = (url, username) => {
  return {
    type: WEBSOCKET_CONNECT,
    username,
  };
};

export const registerSuccess = player => {
  return {
    type: WEBSOCKET_REGISTER_SUCCESS,
    player,
  };
};

export const updateGameState = data => {
  return {
    type: WEBSOCKET_GAME_UPDATE,
    players: data.snakes,
    foods: data.foods,
  };
};

export const webSocketActions = {
  connectToServer,
  registerSuccess,
  updateGameState,
};
