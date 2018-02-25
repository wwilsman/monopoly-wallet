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
  UNIMPROVE_GROUP,
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
  UNIMPROVE_GROUP,
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
 * Returns the notice type for an action
 * @param {Object} action - Redux action
 * @returns {String} - Notice type
 */
function noticeType(action) {
  let type = 'game';

  if (action.type in PLAYER_ACTIONS) {
    type = 'player';
  } else if (action.type in PROPERTY_ACTIONS) {
    type = 'property';
  } else if (action.type in AUCTION_ACTIONS) {
    type = 'auction';
  } else if (action.type in TRADE_ACTIONS) {
    type = 'trade';
  }

  return type;
}

/**
 * Reducer for generating action notices
 * @param {Object} state - Notice state
 * @param {Object} action - Redux action
 */
export default (state = initialState, action) => {
  if (action.type in ACTIONS && action.notice) {
    return {
      id: action.notice.id,
      type: noticeType(action),
      message: action.notice.message,
      meta: ['player', 'property', 'properties', 'other', 'amount'].reduce((m, k) => {
        if (action.hasOwnProperty(k) && typeof action[k] !== 'undefined')
          m[k] = action[k];
        return m;
      }, {})
    };
  }

  return state;
};
