import { bindActionCreators } from 'redux';
import { eventChannel } from 'redux-saga';
import {
  WEBSOCKET_CONNECT,
  WEBSOCKET_CANCEL,
  webSocketActions,
} from '../actions/websocket';
import { call, put, take, race, takeEvery } from 'redux-saga/effects';
import io from 'socket.io-client';
import {
  PLAYER_MOVE,
  PLAYER_SPEED_UP,
  PLAYER_SPEED_DOWN,
} from '../actions/mousemove';
import sp from 'schemapack';
import axios from 'axios';

const gameUpdate = sp.build({
  snakes: [
    {
      id: 'uint16',
      x: 'int16',
      y: 'int16',
      length: 'uint16',
      scale: 'float32',
      points: [
        {
          x: 'int16',
          y: 'int16',
        },
      ],
      width: 'float32',
    },
  ],
  foods: [
    {
      x: 'int16',
      y: 'int16',
      width: 'float32',
    },
  ],
});

function socketListener(ws, username) {
  return eventChannel(emitter => {
    const actions = bindActionCreators(webSocketActions, emitter);

    // ws.on('connect', () => {
    //   console.log('Connected!');
    ws.emit('register', username);
    // actions.connectToServer(url, username);
    // });

    ws.on('register-success', actions.registerSuccess);

    ws.on('game-update', data =>
      actions.updateGameState(gameUpdate.decode(data))
    );
    // ws.on('message', (e) => {
    //   // console.log(e);
    //   ws.emit('message', 'fdp');
    // });
    // /* eslint-disable-next-line */

    // ws.onopen = e => {
    //   //ws.send(JSON.stringify({ type: 'move', ...subscribeData }));
    // };

    // ws.onclose = eventHandlers.onclose;

    // ws.onerror = eventHandlers.onerror;

    // ws.onmessage = eventHandlers.onmessage;
    // return ws.close;
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
    takeEvery(PLAYER_MOVE, action => ws.emit('move', action)),
    takeEvery(PLAYER_SPEED_UP, () => {
      ws.emit('player-speed-up');
    }),
    takeEvery(PLAYER_SPEED_DOWN, () => ws.emit('player-speed-down')),
  ];
}

function* webSocketSaga() {
  while (true) {
    const payload = yield take(WEBSOCKET_CONNECT);
    const { data } = yield axios.get('http://localhost:9000/connect');
    console.log(data);

    const ws = io(`ws://${data.url}`, {
      transports: ['websocket'],
      upgrade: false,
    });

    const socketChannel = yield call(socketListener, ws, payload.name);

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
