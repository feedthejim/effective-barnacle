export const WEBSOCKET_CONNECT = 'WEBSOCKET_CONNECT';
export const WEBSOCKET_REGISTER_SUCCESS = 'WEBSOCKET_REGISTER_SUCCESS';

export const connectToServer = (url, username) => {
  return {
    type: WEBSOCKET_CONNECT,
    url,
    username,
  };
};

export const registerSuccess = (username) => {
  return {
    type: WEBSOCKET_REGISTER_SUCCESS,
    username,
  };
};


export const webSocketActions = {
  connectToServer,
  registerSuccess,
};