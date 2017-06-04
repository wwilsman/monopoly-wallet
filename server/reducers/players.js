import {
  JOIN_GAME,
  BUY_PROPERTY
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
        balance: config.playerStart
      };

    case BUY_PROPERTY:
      return { ...state,
        balance: state.balance - action.amount
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
      return state.map((pl) => (
        pl.id === action.player.id ?
          player(pl, action, config) : pl
      ));

    default:
      return state;
  }
};
