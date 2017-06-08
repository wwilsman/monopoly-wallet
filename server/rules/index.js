import {
  getPlayer,
  getProperty
} from '../helpers';

import {
  JOIN_GAME,
  BUY_PROPERTY,
  IMPROVE_PROPERTY
} from '../actions';
import PLAYER_RULES from './players';
import PROPERTY_RULES from './properties';

// Rules for all game actions
const ALL_RULES = {
  ...PLAYER_RULES,
  ...PROPERTY_RULES
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

    // get player data
    if (action.player) {
      action.player = getPlayer(state, action.player.id) || action.player;
    }

    // get property data
    if (action.property) {
      action.property = getProperty(state, action.property.id);
    }

    // need amounts for these actions
    if (!action.amount) {
      if (action.type === JOIN_GAME) {
        action.amount = config.playerStart;
      } else if (action.type === BUY_PROPERTY) {
        action.amount = action.property.price;
      } else if (action.type === IMPROVE_PROPERTY) {
        action.amount = action.property.cost;
      }
    }

    // calculate houses/hotels for improving properties
    if (action.type === IMPROVE_PROPERTY) {
      action.houses = action.property.buildings === 4 ? -4 : 1;
      action.hotels = action.property.buildings === 4 ? 1 : 0;
    }

    // check against rules for action
    if (ALL_RULES[action.type]) {
      for (let test of ALL_RULES[action.type]) {
        test(state, action, config);
      }
    }

    // continue to dispatch
    return next(action);
  };
};
