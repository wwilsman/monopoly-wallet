import {
  JOIN_GAME,
  MAKE_TRANSFER_TO,
  MAKE_TRANSFER_FROM,
  MAKE_TRANSFER_WITH,
  CLAIM_BANKRUPTCY
} from '../actions/players';
import {
  BUY_PROPERTY,
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY,
  MORTGAGE_PROPERTY,
  UNMORTGAGE_PROPERTY,
  PAY_RENT
} from '../actions/properties';
import {
  AUCTION_PROPERTY,
  PLACE_BID,
  CONCEDE_AUCTION,
  CANCEL_AUCTION,
  CLOSE_AUCTION
} from '../actions/auction';
import {
  MAKE_OFFER,
  DECLINE_OFFER,
  ACCEPT_OFFER
} from '../actions/trades';

const PLAYER_ACTIONS = {
  JOIN_GAME,
  MAKE_TRANSFER_TO,
  MAKE_TRANSFER_FROM,
  MAKE_TRANSFER_WITH,
  CLAIM_BANKRUPTCY
};

const PROPERTY_ACTIONS = {
  BUY_PROPERTY,
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY,
  MORTGAGE_PROPERTY,
  UNMORTGAGE_PROPERTY,
  PAY_RENT
};

const AUCTION_ACTIONS = {
  AUCTION_PROPERTY,
  PLACE_BID,
  CONCEDE_AUCTION,
  CANCEL_AUCTION,
  CLOSE_AUCTION
};

const TRADE_ACTIONS = {
  MAKE_OFFER,
  DECLINE_OFFER,
  ACCEPT_OFFER
};

const ACTIONS = {
  ...PLAYER_ACTIONS,
  ...PROPERTY_ACTIONS,
  ...AUCTION_ACTIONS,
  ...TRADE_ACTIONS
};

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
