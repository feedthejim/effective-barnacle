import { bindActionCreators } from 'redux'
import { eventChannel } from 'redux-saga'
import { WEBSOCKET_CONNECT, webSocketActions } from './actions/websocket'
import { takeEvery, call, put, take } from 'redux-saga/effects'
import io from 'socket.io-client'

const connectSocket = (url, username) =>
  eventChannel(emitter => {
    const ws = io('ws://localhost:4242')
    const actions = bindActionCreators(webSocketActions, emitter)

    // ws.on('connect', () => {
    //   console.log('Connected!');
    ws.emit('register', username)
    actions.connectToServer(url, username)
    // });

    ws.on('register-success', data => {
      console.log('you registered with id:', data)
      actions.registerSuccess(data)
    })

    ws.on('game-update', actions.updateGameState)
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
    return ws.close
  })

const webSocketSaga = function*(action) {
  const socketChannel = yield call(connectSocket, action.url, action.username)
  while (true) {
    const eventAction = yield take(socketChannel)
    yield put(eventAction)
  }
}

const rootSaga = function*() {
  yield takeEvery(WEBSOCKET_CONNECT, webSocketSaga)
}

// export const rootSaga = webSocketSaga;

export default rootSaga
