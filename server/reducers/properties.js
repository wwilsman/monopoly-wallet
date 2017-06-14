import {
  CLAIM_BANKRUPTCY
} from '../actions/players';
import {
  BUY_PROPERTY,
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY,
  MORTGAGE_PROPERTY,
  UNMORTGAGE_PROPERTY
} from '../actions/properties';
import {
  ACCEPT_OFFER
} from '../actions/trades';

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
        owner: action.player.token
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

    case UNMORTGAGE_PROPERTY:
      return { ...state,
        mortgaged: false
      };

    case CLAIM_BANKRUPTCY:
    case ACCEPT_OFFER:
      return { ...state,
        owner: action.other.token
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
    case UNMORTGAGE_PROPERTY:
      return { ...state,
        [action.property.id]: property(state[action.property.id], action)
      };

    case CLAIM_BANKRUPTCY:
    case ACCEPT_OFFER:
      return action.properties.reduce((state, id) => {
        state[id] = property(state[id], action);
        return state;
      }, { ...state });

    default:
      return state;
  }
};
