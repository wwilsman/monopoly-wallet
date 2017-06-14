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

    // create meta
    let meta = { state, config };

    // initial meta
    meta.auction = state.auction;
    meta.player = action.player &&
      (action.player = calc(action.player, meta)) &&
      getPlayer(state, action.player.token) || action.player;
    meta.property = action.property &&
      (action.property = calc(action.property, meta)) &&
      getProperty(state, action.property.id);
    meta.group = action.property && getProperties(state, meta.property.group);
    meta.trade = action.trade && getTrade(state, action.trade.id);
    meta.other = action.other && (action.other = calc(action.other, meta)) &&
      getPlayer(state, action.other.token) || action.other;
    meta.properties = action.properties &&
      calc(action.properties, meta, []).map((id) => getProperty(state, id));

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
 * @param {Mixed} [defValue=false] - Default value to return on error
 * @returns {Mixed} The calculated value
 */
function calc(value, meta, defValue = false) {
  try {
    return value && value.__calc ?
      value.get(meta) : value;
  } catch (e) {
    return defValue;
  }
}
