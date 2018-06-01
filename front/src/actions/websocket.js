export const WEBSOCKET_CONNECT = 'WEBSOCKET_CONNECT';
export const WEBSOCKET_REGISTER_SUCCESS = 'WEBSOCKET_REGISTER_SUCCESS';
export const WEBSOCKET_GAME_UPDATE = 'WEBSOCKET_GAME_UPDATE';

export const connectToServer = (url, username) => {
  return {
    type: WEBSOCKET_CONNECT,
    url,
    username,
  };
};

export const registerSuccess = id => {
  return {
    type: WEBSOCKET_REGISTER_SUCCESS,
    id,
  };
};

export const updateGameState = players => {
  return {
    type: WEBSOCKET_GAME_UPDATE,
    players,
  };
};

export const webSocketActions = {
  connectToServer,
  registerSuccess,
  updateGameState,
};
