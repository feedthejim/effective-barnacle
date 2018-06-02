import { all } from 'redux-saga/effects';
import mouseMoveSaga from './mousemove';
import webSocketSaga from './websockets';

const rootSaga = function*() {
  yield all([webSocketSaga(), mouseMoveSaga()]);
};

// export const rootSaga = webSocketSaga;

export default rootSaga;
