import {
  BUY_PROPERTY
} from '../actions';

/**
 * Reducer for a single property
 * @param {Object} state - Property state
 * @param {Object} action - Redux action
 * @param {Object} config - Game config
 * @returns {Object} Reduced state
 */
const property = (state, action, config) => {
  switch (action.type) {
    case BUY_PROPERTY:
      return {
        ...state,
        owner: action.player.id
      };

    default:
      return state;
  }
};

/**
 * Properties reducer
 * @param {Array} state - Array of property states
 * @param {Object} action - Redux action
 * @param {Object} config - Game config
 * @returns {Array} Reduced state
 */
export default (state = [], action, config) => {
  switch (action.type) {
    case BUY_PROPERTY:
      return state.map((pr) => (
        pr.id === action.property.id ?
          property(pr, action, config) : pr
      ));

    default:
      return state;
  }
};
