import {
  JOIN_GAME,
  MAKE_TRANSFER_TO,
  MAKE_TRANSFER_FROM,
  CLAIM_BANKRUPTCY
} from '../actions/players';
import {
  BUY_PROPERTY,
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY,
  UNIMPROVE_GROUP,
  MORTGAGE_PROPERTY,
  UNMORTGAGE_PROPERTY
} from '../actions/properties';
import {
  CLOSE_AUCTION
} from '../actions/auction';

/**
 * Reducer for the bank
 * @param {Object} state - Current state to reduce
 * @param {Object} action - Redux action
 * @returns {Object} Reduced state
 */
export default (state = Infinity, action) => {
  switch (action.type) {
    case JOIN_GAME:
    case MAKE_TRANSFER_TO:
    case UNIMPROVE_PROPERTY:
    case UNIMPROVE_GROUP:
    case MORTGAGE_PROPERTY:
      return state - action.amount;

    case BUY_PROPERTY:
    case MAKE_TRANSFER_FROM:
    case IMPROVE_PROPERTY:
    case UNMORTGAGE_PROPERTY:
    case CLOSE_AUCTION:
      return state + action.amount;

    case CLAIM_BANKRUPTCY:
      return action.other.id === 'bank' ?
        state + action.amount : state;

    default:
      return state;
  }
};
