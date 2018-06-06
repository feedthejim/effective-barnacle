import { eventChannel } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';
import {
  MOUSE_MOVE,
  PLAYER_SPEED_DOWN,
  PLAYER_SPEED_UP,
} from '../actions/mousemove';
import { WEBSOCKET_CONNECT } from '../actions/websocket';

const createMouseChannel = () => {
  return eventChannel(emitter => {
    // finger|mouse move event
    window.addEventListener('mousemove', mouseEvent => {
      mouseEvent.preventDefault();
      emitter({
        type: MOUSE_MOVE,
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
      });
    });

    window.addEventListener('mousedown', mouseEvent => {
      mouseEvent.preventDefault();
      emitter({
        type: PLAYER_SPEED_UP,
      });
    });

    window.addEventListener('mouseup', mouseEvent => {
      mouseEvent.preventDefault();
      emitter({
        type: PLAYER_SPEED_DOWN,
      });
    });

    const unsubscribe = () => {
      window.removeEventListener('mousemove');
      window.removeEventListener('mouseup');
      window.removeEventListener('mousedown');
    };

    return unsubscribe;
  });
};

const mouseMoveSaga = function*() {
  yield take(WEBSOCKET_CONNECT);
  const mouseMoveChannel = yield call(createMouseChannel);
  while (true) {
    const action = yield take(mouseMoveChannel);
    yield put(action);
  }
};

export default mouseMoveSaga;
