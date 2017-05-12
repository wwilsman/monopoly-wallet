import {
  JOIN_GAME
} from '../actions';

import players from './players';

// Default game state
export const defaultState = {
  bank: Infinity,
  houses: Infinity,
  hotels: Infinity,
  players: [],
  properties: [],
  trades: [],
  auction: {},
  notice: {}
};

/**
 * Game reducer
 * @param {Object} state - Current state to reduce
 * @param {Object} action - Redux action
 * @param {Object} config - Game config
 * @returns {Object} Reduced state
 */
export default (state = defaultState, action, config) => {
  switch (action.type) {
    case JOIN_GAME:
      return { ...state,
        bank: state.bank - config.playerStart,
        players: players(state.players, action, config)
      };

    default:
      return state;
  }
};
