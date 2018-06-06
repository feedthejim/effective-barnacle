import { eventChannel } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';
import { MOUSE_MOVE } from '../actions/mousemove';

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

export default mouseMoveSaga;
