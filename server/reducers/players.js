import {
  JOIN_GAME
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
      return [
        ...state,
        player(undefined, action, config)
      ];

    default:
      return state;
  }
};
