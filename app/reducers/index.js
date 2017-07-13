import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import appReducer from './app';

export default combineReducers({
  app: appReducer,
  router: routerReducer
});
