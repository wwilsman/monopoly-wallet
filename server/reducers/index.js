import {
  JOIN_GAME,
  BUY_PROPERTY,
  MAKE_TRANSFER_TO,
  MAKE_TRANSFER_FROM,
  MAKE_TRANSFER_WITH
} from '../actions';

import players from './players';
import properties from './properties';

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
 * Game reducer manually split to pass around game config
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

    case BUY_PROPERTY:
      return { ...state,
        bank: state.bank + action.amount,
        players: players(state.players, action, config),
        properties: properties(state.properties, action, config)
      };

    case MAKE_TRANSFER_TO:
      return { ...state,
        bank: state.bank - action.amount,
        players: players(state.players, action, config)
      };

    case MAKE_TRANSFER_FROM:
      return { ...state,
        bank: state.bank + action.amount,
        players: players(state.players, action, config)
      };

    case MAKE_TRANSFER_WITH:
      return { ...state,
        players: players(state.players, action, config)
      };

    default:
      return state;
  }
};
