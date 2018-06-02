import { bindActionCreators } from 'redux';
import { eventChannel } from 'redux-saga';
import {
  WEBSOCKET_CONNECT,
  WEBSOCKET_CANCEL,
  webSocketActions,
} from '../actions/websocket';
import { call, put, take, race } from 'redux-saga/effects';
import io from 'socket.io-client';
import { MOUSE_MOVE } from '../actions/mousemove';

function socketListener(ws, url, username) {
  return eventChannel(emitter => {
    const actions = bindActionCreators(webSocketActions, emitter);

    // ws.on('connect', () => {
    //   console.log('Connected!');
    ws.emit('register', username);
    actions.connectToServer(url, username);
    // });

    ws.on('register-success', data => {
      console.log('you registered with id:', data);
      actions.registerSuccess(data);
    });

    ws.on('game-update', actions.updateGameState);
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
  while (true) {
    const mouseCoords = yield take(MOUSE_MOVE);
    ws.emit('move-player', mouseCoords);
    //socket.send(JSON.stringify({ type: 'setTask', status: 'open' }));
  }
}

function* webSocketSaga() {
  while (true) {
    const data = yield take(WEBSOCKET_CONNECT);
    const ws = io('ws://localhost:4242');

    const socketChannel = yield call(socketListener, ws, data.url, data.name);

    const { cancel } = yield race({
      task: [call(externalListener, socketChannel), call(internalListener, ws)],
      cancel: take(WEBSOCKET_CANCEL),
    });

    if (cancel) {
      ws.close();
    }
  }
}
// }

// const connectSocket = (url, username) =>
//   eventChannel(emitter => {
//     const ws = io('ws://localhost:4242');
//     const actions = bindActionCreators(webSocketActions, emitter);

//     // ws.on('connect', () => {
//     //   console.log('Connected!');
//     ws.emit('register', username);
//     actions.connectToServer(url, username);
//     // });

//     ws.on('register-success', data => {
//       console.log('you registered with id:', data);
//       actions.registerSuccess(data);
//     });

//     ws.on('game-update', actions.updateGameState);
//     // ws.on('message', (e) => {
//     //   // console.log(e);
//     //   ws.emit('message', 'fdp');
//     // });
//     // /* eslint-disable-next-line */

//     // ws.onopen = e => {
//     //   //ws.send(JSON.stringify({ type: 'move', ...subscribeData }));
//     // };

//     // ws.onclose = eventHandlers.onclose;

//     // ws.onerror = eventHandlers.onerror;

//     // ws.onmessage = eventHandlers.onmessage;
//     // return ws.close;
//     return ws.close;
//   });

// const webSocketSagaCreator = function*(action) {
//   const socketChannel = yield call(connectSocket, action.url, action.username);
//   while (true) {
//     const eventAction = yield take(socketChannel);
//     yield put(eventAction);
//   }
// };

// const webSocketSaga = function*() {
//   yield takeEvery(WEBSOCKET_CONNECT, webSocketSagaCreator);
// };

export default webSocketSaga;
