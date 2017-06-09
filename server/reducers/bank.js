import {
  JOIN_GAME,
  BUY_PROPERTY,
  MAKE_TRANSFER_TO,
  MAKE_TRANSFER_FROM,
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY,
  MORTGAGE_PROPERTY,
  UNMORTGAGE_PROPERTY
} from '../actions';

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
    case MORTGAGE_PROPERTY:
      return state - action.amount;

    case BUY_PROPERTY:
    case MAKE_TRANSFER_FROM:
    case IMPROVE_PROPERTY:
    case UNMORTGAGE_PROPERTY:
      return state + action.amount;

    default:
      return state;
  }
};
