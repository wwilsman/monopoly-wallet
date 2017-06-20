import ACTIONS, {
  PLAYER_ACTIONS,
  PROPERTY_ACTIONS,
  AUCTION_ACTIONS,
  TRADE_ACTIONS
} from '../actions';

// initial notice
const initialState = {
  message: 'Game initialized',
  type: 'init',
  meta: {}
};

/**
 * Reducer for generating action notices
 * @param {Object} state - Notice state
 * @param {Object} action - Redux action
 */
export default (state = initialState, action) => {
  if (action.type in ACTIONS && action.notice) {
    return { ...action.notice,
      type: (action.type in PLAYER_ACTIONS) ? 'player' :
        (action.type in PROPERTY_ACTIONS) ? 'property' :
        (action.type in AUCTION_ACTIONS) ? 'auction' :
        (action.type in TRADE_ACTIONS) ? 'trade' :
        'game',
      meta: ['player', 'property', 'other', 'amount'].reduce((m, k) => {
        if (action.hasOwnProperty(k) && typeof action[k] !== 'undefined')
          m[k] = action[k];
        return m;
      }, {})
    };
  }

  return state;
};
