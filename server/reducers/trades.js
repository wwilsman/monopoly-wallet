import {
  MAKE_OFFER,
  DECLINE_OFFER
} from '../actions/trades';

/**
 * Reducer for a single trade
 * @param {Object} state - Current state to reduce
 * @param {Object} action - Redux action
 * @returns {Object} Reduced state
 */
const trade = (state, action) => {
  switch (action.type) {
    case MAKE_OFFER:
      return {
        id: action.trade.id,
        from: action.player.token,
        with: action.other.token,
        properties: action.properties,
        amount: action.amount
      };

    default:
      return state;
  }
};

/**
 * Reducer for trades
 * @param {Object} state - Current state to reduce
 * @param {Object} action - Redux action
 * @returns {Object} Reduced state
 */
export default (state = {}, action) => {
  switch (action.type) {
    case MAKE_OFFER:
      return { ...state,
        [action.trade.id]: trade(state[action.trade.id], action)
      };

    case DECLINE_OFFER:
      state = { ...state };
      delete state[action.trade.id];
      return state;

    default:
      return state;
  }
};
