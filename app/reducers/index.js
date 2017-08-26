import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import appReducer from './app';
import gameReducer from './game';
import toastsReducer from './toasts';

export default combineReducers({
  app: appReducer,
  game: gameReducer,
  toasts: toastsReducer,
  router: routerReducer
});
