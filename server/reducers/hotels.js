import {
  IMPROVE_PROPERTY
} from '../actions';

/**
 * Reducer for available hotels
 * @param {Object} state - Current state to reduce
 * @param {Object} action - Redux action
 * @returns {Object} Reduced state
 */
export default (state = Infinity, action) => {
  switch (action.type) {
    case IMPROVE_PROPERTY:
      return state - action.houses;

    default:
      return state;
  }
};
