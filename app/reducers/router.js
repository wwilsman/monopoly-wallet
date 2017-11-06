import {
  PUSH,
  REPLACE,
  LOCATION_CHANGED
} from '../actions/router';

/**
 * Router reducer which updates the location state
 * @param {Object} state - location state
 * @param {Object} action - Redux action
 */
export default (state = { location: {} }, action) => {
  switch (action.type) {
    case PUSH:
    case REPLACE:
    case LOCATION_CHANGED:
      return {
        ...state,
        location: {
          ...state.location,
          ...action.location
        }
      };

    default:
      return state;
  }
};
