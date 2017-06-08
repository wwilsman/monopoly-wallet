import {
  getPlayer,
  getProperty,
  getProperties
} from '../helpers';

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

    // create initial meta
    let meta = { state, config };

    meta.player = action.player &&
      getPlayer(state, action.player.id) || action.player;
    meta.property = action.property &&
      getProperty(state, action.property.id);
    meta.group = action.property &&
      getProperties(state, meta.property.group);

    // run action calculations and build remaining meta
    action = Object.keys(action).reduce((a, k) => {
      a[k] = a[k] && a[k].__calc ? a[k].get(meta) : a[k];
      if (k !== 'type' && !meta[k]) meta[k] = a[k];
      return a;
    }, action);

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
