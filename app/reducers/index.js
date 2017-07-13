import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import appReducer from './app';
import gameReducer from './game';

export default combineReducers({
  app: appReducer,
  game: gameReducer,
  router: routerReducer
});
