import {
  MAKE_OFFER
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
        amount: action.amount,
        properties: action.properties,
        players: [
          action.player.id,
          action.other.id
        ]
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
export default (state = [], action) => {
  switch (action.type) {
    case MAKE_OFFER:
      return [ ...state,
        trade(undefined, action)
      ];

    default:
      return state;
  }
}
