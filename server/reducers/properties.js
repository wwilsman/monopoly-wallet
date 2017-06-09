import {
  BUY_PROPERTY,
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY,
  MORTGAGE_PROPERTY
} from '../actions';

/**
 * Reducer for a single property
 * @param {Object} state - Property state
 * @param {Object} action - Redux action
 * @returns {Object} Reduced state
 */
const property = (state, action) => {
  switch (action.type) {
    case BUY_PROPERTY:
      return { ...state,
        owner: action.player.id
      };

    case IMPROVE_PROPERTY:
      return { ...state,
        buildings: state.buildings + 1
      };

    case UNIMPROVE_PROPERTY:
      return { ...state,
        buildings: state.buildings - 1
      };

    case MORTGAGE_PROPERTY:
      return { ...state,
        mortgaged: true
      };

    default:
      return state;
  }
};

/**
 * Properties reducer
 * @param {Array} state - Array of property states
 * @param {Object} action - Redux action
 * @returns {Array} Reduced state
 */
export default (state = [], action) => {
  switch (action.type) {
    case BUY_PROPERTY:
    case IMPROVE_PROPERTY:
    case UNIMPROVE_PROPERTY:
    case MORTGAGE_PROPERTY:
      return state.map((pr) => (
        pr.id === action.property.id ?
          property(pr, action) : pr
      ));

    default:
      return state;
  }
};
