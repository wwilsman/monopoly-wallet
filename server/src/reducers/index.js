import { combineReducers } from 'redux';
import diffable from 'redux-deep-diff';

import bank from './bank';
import houses from './houses';
import hotels from './hotels';
import players from './players';
import properties from './properties';
import auction from './auction';
import trades from './trades';
import notice from './notice';
import hydratable from './hydrate';

/**
 * Main reducer for our game
 */
export default hydratable(
  diffable(
    combineReducers({
      bank,
      houses,
      hotels,
      players,
      properties,
      auction,
      trades,
      notice
    }), {
      // do not diff auctions or trades; we don't need their history
      prefilter(path, key) {
        return ['auction', 'trades'].includes(key);
      },
      // flatten notice diffs because most properties change at once
      flatten(path, key) {
        return key === 'notice';
      }
    }
  )
);
