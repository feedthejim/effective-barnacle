import { bindActionCreators } from 'redux';
import { eventChannel } from 'redux-saga';
import { WEBSOCKET_CONNECT, webSocketActions } from './actions/websocket';
import { all, takeEvery, call, put, take } from 'redux-saga/effects';
import io from 'socket.io-client';

const connectSocket = (url, username) =>
  eventChannel(emitter => {
    const ws = io('ws://localhost:4242');
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

const webSocketSagaCreator = function*(action) {
  const socketChannel = yield call(connectSocket, action.url, action.username);
  while (true) {
    const eventAction = yield take(socketChannel);
    yield put(eventAction);
  }
};

const createMouseChannel = () => {
  return eventChannel(emitter => {
    // finger|mouse move event

    window.addEventListener('mousemove', mouseEvent => {
      mouseEvent.preventDefault();
      emitter({
        type: 'MOUSE_MOVE',
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
      });
    });

    const unsubscribe = () => {
      window.removeEventListener('mousemove');
    };

    return unsubscribe;
  });
};

const mouseMoveSaga = function*() {
  const mouseMoveChannel = yield call(createMouseChannel);

  while (true) {
    const action = yield take(mouseMoveChannel);
    yield put(action);
  }
};

const webSocketSaga = function*() {
  yield takeEvery(WEBSOCKET_CONNECT, webSocketSagaCreator);
};

const rootSaga = function*() {
  yield all([webSocketSaga(), mouseMoveSaga()]);
};

// export const rootSaga = webSocketSaga;

export default rootSaga;
