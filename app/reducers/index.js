import { combineReducers } from 'redux';

import appReducer from './app';
import gameReducer from './game';
import toastsReducer from './toasts';
import routerReducer from './router';

export default combineReducers({
  app: appReducer,
  game: gameReducer,
  toasts: toastsReducer,
  router: routerReducer
});
