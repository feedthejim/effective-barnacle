import { all } from 'redux-saga/effects';
import mouseMoveSaga from './mousemove';
import webSocketSaga from './websockets';
import playerMoveSaga from './playermove';

const rootSaga = function*() {
  yield all([webSocketSaga(), mouseMoveSaga(), playerMoveSaga()]);
};

// export const rootSaga = webSocketSaga;

export default rootSaga;
