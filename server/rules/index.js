import { JOIN_GAME } from '../actions';
import JOIN_RULES from './join';

// Rules for all game actions
const ALL_RULES = {
  ...JOIN_RULES
};

/**
 * Finds a player in the game state
 * @param {Object} state - Game state
 * @param {String} id - Player ID
 * @returns {Object} Player data
 */
const getPlayer = (state, id) => {
  return state.players.find((pl) => pl.id === id);
};

/**
 * Middleware to gather additional data for actions and run them against
 * sets of rules before dispatching
 * @param {Object} config - Game config
 * @param {Function} callback - Callback called on error
 * @returns {Function} Middleware to be used with `applyMiddleware`
 */
export default (config) => {
  return (store) => (next) => (action) => {
    const state = store.getState();

    // initial meta info
    let meta = { state };
    meta.needed = {};

    // get player data
    if (action.player) {
      meta.player = getPlayer(state, action.player.id) || action.player;
    }

    // need an amount
    if (action.amount) {
      meta.needed.amount = action.amount;
    } else if (action.type === JOIN_GAME) {
      meta.needed.amount = config.playerStart;
    }

    // check against rules for action
    if (ALL_RULES[action.type]) {
      for (let test of ALL_RULES[action.type]) {
        test(meta);
      }
    }

    // continue to dispatch
    return next(action);
  };
};
