import { combineReducers } from 'redux';

import bank from './bank';
import houses from './houses';
import hotels from './hotels';
import players from './players';
import properties from './properties';
import auction from './auction';
import trades from './trades';

/**
 * Main reducer for our game
 */
export default combineReducers({
  bank,
  houses,
  hotels,
  players,
  properties,
  auction,
  trades
});
