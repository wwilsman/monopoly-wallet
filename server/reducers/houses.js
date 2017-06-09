import {
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY
} from '../actions';

/**
 * Reducer for available houses
 * @param {Object} state - Current state to reduce
 * @param {Object} action - Redux action
 * @returns {Object} Reduced state
 */
export default (state = Infinity, action) => {
  switch (action.type) {
    case IMPROVE_PROPERTY:
    case UNIMPROVE_PROPERTY:
      return state - action.houses;

    default:
      return state;
  }
};
