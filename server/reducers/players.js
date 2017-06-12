import slug from 'slug';

import {
  JOIN_GAME,
  MAKE_TRANSFER_TO,
  MAKE_TRANSFER_FROM,
  MAKE_TRANSFER_WITH,
  CLAIM_BANKRUPTCY
} from '../actions/players';
import {
  BUY_PROPERTY,
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY,
  MORTGAGE_PROPERTY,
  UNMORTGAGE_PROPERTY,
  PAY_RENT
} from '../actions/properties';

/**
 * Reducer for a single player
 * @param {Object} state - Player state
 * @param {Object} action - Redux action
 * @returns {Object} Reduced state
 */
const player = (state, action) => {
  switch (action.type) {
    case JOIN_GAME:
      return {
        id: slug(
          `${action.player.name}_${action.player.token}`,
          { lower: true }
        ),
        name: action.player.name,
        token: action.player.token,
        balance: action.amount,
        bankrupt: false
      };

    case MAKE_TRANSFER_TO:
    case UNIMPROVE_PROPERTY:
    case MORTGAGE_PROPERTY:
      return { ...state,
        balance: state.balance + action.amount
      };

    case BUY_PROPERTY:
    case MAKE_TRANSFER_FROM:
    case IMPROVE_PROPERTY:
    case UNMORTGAGE_PROPERTY:
      return { ...state,
        balance: state.balance - action.amount
      };

    case MAKE_TRANSFER_WITH:
    case PAY_RENT:
      return { ...state,
        balance: state.id === action.other.id ?
          state.balance + action.amount :
          state.balance - action.amount
      };

    case CLAIM_BANKRUPTCY:
      return { ...state,
        balance: state.id === action.other.id ?
          state.balance + action.amount :
          state.balance - action.amount,
        bankrupt: state.id === action.player.id
      };

    default:
      return state;
  }
};

/**
 * Players reducer
 * @param {Array} state - Array of player states
 * @param {Object} action - Redux action
 * @returns {Array} Reduced state
 */
export default (state = [], action) => {
  switch (action.type) {
    case JOIN_GAME:
      return [ ...state,
        player(undefined, action)
      ];

    case BUY_PROPERTY:
    case MAKE_TRANSFER_TO:
    case MAKE_TRANSFER_FROM:
    case IMPROVE_PROPERTY:
    case UNIMPROVE_PROPERTY:
    case MORTGAGE_PROPERTY:
    case UNMORTGAGE_PROPERTY:
      return state.map((pl) => (
        pl.id === action.player.id ?
          player(pl, action) : pl
      ));

    case PAY_RENT:
    case MAKE_TRANSFER_WITH:
    case CLAIM_BANKRUPTCY:
      return state.map((pl) => (
        (pl.id === action.player.id ||
         pl.id === action.other.id) ?
          player(pl, action) : pl
      ));

    default:
      return state;
  }
};
