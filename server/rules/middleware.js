import {
  getPlayer,
  getProperty,
  getProperties,
  getTrade
} from '../helpers';

import rules from './definitions';

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

    // initial meta
    meta.player = action.player &&
      getPlayer(state, action.player.token) || action.player;
    meta.property = action.property &&
      getProperty(state, action.property.id);
    meta.group = action.property &&
      getProperties(state, meta.property.group);
    meta.trade = action.trade &&
      getTrade(state, action.trade.id);
    meta.auction = state.auction;

    // calculated meta
    meta.properties = action.properties &&
      calc(action.properties, meta, []).map((id) => getProperty(state, id));
    meta.other = action.other && (action.other = calc(action.other, meta)) &&
      getPlayer(state, action.other.token) || action.other;

    // run action calculations and build remaining meta
    action = Object.keys(action).reduce((a, k) => {
      a[k] = calc(a[k], meta);
      if (!meta.hasOwnProperty(k))
        meta[k] = a[k];
      return a;
    }, action);

    // check against rules for action
    if (rules[action.type]) {
      for (let test of rules[action.type]) {
        test(meta);
      }
    }

    // continue to dispatch
    return next(action);
  };
};

/**
 * Calculates certain values from meta; returns a default value on error
 * @param {Mixed} value - The value to calculate
 * @param {Object} meta - Meta to make the calculation with
 * @param {Mixed} [def=false] - Default value to return on error
 * @returns {Mixed} The calculated value
 */
function calc(value, meta, def = false) {
  try {
    return value && value.__calc ?
      value.get(meta) : value;
  } catch (e) {
    return def;
  }
}
