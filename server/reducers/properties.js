import {
  CLAIM_BANKRUPTCY
} from '../actions/players';
import {
  BUY_PROPERTY,
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY,
  MORTGAGE_PROPERTY,
  UNMORTGAGE_PROPERTY,
  MONOPOLIZE_PROPERTY
} from '../actions/properties';
import {
  CLOSE_AUCTION
} from '../actions/auction';
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
    case CLOSE_AUCTION:
      return { ...state,
        owner: action.player.token,
        monopoly: action.property
          ? action.property.monopoly
          : state.monopoly
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
        owner: action.other.token,
        monopoly: action.property
          ? action.property.monopoly
          : state.monopoly
      };

    case MONOPOLIZE_PROPERTY:
      return { ...state,
        monopoly: action.property.monopoly
      };

    default:
      return state;
  }
};

/**
 * Properties reducer
 * @param {Object} state - Property states keyed by id
 * @param {Object} action - Redux action
 * @returns {Array} Reduced state
 */
export default (state = {}, action) => {
  switch (action.type) {
    case BUY_PROPERTY:
    case IMPROVE_PROPERTY:
    case UNIMPROVE_PROPERTY:
    case MORTGAGE_PROPERTY:
    case UNMORTGAGE_PROPERTY:
    case CLOSE_AUCTION:
      return state._all.reduce((state, id) => {
        if (id === action.property.id) {
          state[id] = property(state[id], action);

        // send a different action to properties that are affected by
        // this property's monopolization
        } else if (state[id].group === action.property.group) {
          state[id] = property(state[id], {
            property: { monopoly: action.property.monopoly },
            type: MONOPOLIZE_PROPERTY
          });
        }

        return state;
      }, { ...state });

    case CLAIM_BANKRUPTCY:
    case ACCEPT_OFFER:
      return action.properties.reduce((state, { id }) => {
        state[id] = property(state[id], action);
        return state;
      }, { ...state });

    default:
      return state;
  }
};
