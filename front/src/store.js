import { createStore, applyMiddleware } from 'redux';
import reducers from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

export default createStore(
  reducers,
  {},
  composeWithDevTools(
    applyMiddleware(
      sagaMiddleware
    )
  )
);

sagaMiddleware.run(rootSaga);