import { bindActionCreators } from 'redux';
import { eventChannel } from 'redux-saga';
import {
  WEBSOCKET_CONNECT,
  WEBSOCKET_CANCEL,
  webSocketActions,
} from '../actions/websocket';
import { call, put, take, race, takeEvery } from 'redux-saga/effects';
import {
  PLAYER_MOVE,
  PLAYER_SPEED_UP,
  PLAYER_SPEED_DOWN,
} from '../actions/mousemove';
import axios from 'axios';
import msgpack from 'msgpack-lite';

function send(ws, topic, payload = {}) {
  ws.send(msgpack.encode({ Topic: topic, ...payload }));
}

function socketListener(ws, username) {
  return eventChannel(emitter => {
    const actions = bindActionCreators(webSocketActions, emitter);

    console.log(username);
    ws.onopen = () => send(ws, 'register', { Username: username });

    ws.onmessage = event => {
      const msg = msgpack.decode(new Uint8Array(event.data));
      switch (msg.topic) {
        case 'register-success':
          actions.registerSuccess(msg.player);
          break;
        case 'game-update':
          actions.updateGameState(msg);
          break;
      }
    };
    return ws.close;
  });
}

function* externalListener(socketChannel) {
  while (true) {
    const action = yield take(socketChannel);
    yield put(action);
  }
}

function* internalListener(ws) {
  yield [
    takeEvery(PLAYER_MOVE, action => send(ws, 'move', action)),
    takeEvery(PLAYER_SPEED_UP, () => send(ws, 'player-speed-up')),
    takeEvery(PLAYER_SPEED_DOWN, () => send(ws, 'player-speed-down')),
  ];
}

function* webSocketSaga() {
  while (true) {
    const payload = yield take(WEBSOCKET_CONNECT);
    let data = undefined;
    try {
      const response = yield axios.get('http://localhost:9000/connect');
      data = response.data.url;
    } catch (e) {
      data = 'localhost:4242';
    }
    const ws = new WebSocket(`ws://${data}`);
    ws.binaryType = 'arraybuffer';

    const socketChannel = yield call(socketListener, ws, payload.username);

    const { cancel } = yield race({
      task: [call(externalListener, socketChannel), call(internalListener, ws)],
      cancel: take(WEBSOCKET_CANCEL),
    });

    if (cancel) {
      ws.close();
    }
  }
}

export default webSocketSaga;
