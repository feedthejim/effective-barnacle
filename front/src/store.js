import { createStore } from 'redux';
import reducers from './reducers';
import { devToolsEnhancer } from 'redux-devtools-extension';

export default createStore(
  reducers,
  {},
  devToolsEnhancer()
);