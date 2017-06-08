import { combineReducers } from 'redux';

import bank from './bank';
import houses from './houses';
import hotels from './hotels';
import players from './players';
import properties from './properties';

/**
 * Main reducer for our game
 */
export default combineReducers({
  bank,
  houses,
  hotels,
  players,
  properties
});
