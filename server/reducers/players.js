import {
  JOIN_GAME,
  BUY_PROPERTY,
  MAKE_TRANSFER_TO,
  MAKE_TRANSFER_FROM,
  MAKE_TRANSFER_WITH,
  IMPROVE_PROPERTY
} from '../actions';

/**
 * Reducer for a single player
 * @param {Object} state - Player state
 * @param {Object} action - Redux action
 * @param {Object} config - Game config
 * @returns {Object} Reduced state
 */
const player = (state, action, config) => {
  switch (action.type) {
    case JOIN_GAME:
      return {
        id: action.player.id,
        name: action.player.name,
        token: action.player.token,
        balance: config.playerStart,
        bankrupt: false
      };

    case MAKE_TRANSFER_TO:
      return { ...state,
        balance: state.balance + action.amount
      };

    case BUY_PROPERTY:
    case MAKE_TRANSFER_FROM:
    case IMPROVE_PROPERTY:
      return { ...state,
        balance: state.balance - action.amount
      };

    case MAKE_TRANSFER_WITH:
      return { ...state,
        balance: state.id === action.other.id ?
          state.balance + action.amount :
          state.balance - action.amount
      };

    default:
      return state;
  }
};

/**
 * Players reducer
 * @param {Array} state - Array of player states
 * @param {Object} action - Redux action
 * @param {Object} config - Game config
 * @returns {Array} Reduced state
 */
export default (state = [], action, config) => {
  switch (action.type) {
    case JOIN_GAME:
      return [ ...state,
        player(undefined, action, config)
      ];

    case BUY_PROPERTY:
    case MAKE_TRANSFER_TO:
    case MAKE_TRANSFER_FROM:
    case IMPROVE_PROPERTY:
      return state.map((pl) => (
        pl.id === action.player.id ?
          player(pl, action, config) : pl
      ));

    case MAKE_TRANSFER_WITH:
      return state.map((pl) => (
        (pl.id === action.player.id ||
         pl.id === action.other.id) ?
          player(pl, action, config) : pl
      ));

    default:
      return state;
  }
};
