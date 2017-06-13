import {
  getPlayer,
  getProperty,
  getProperties
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

    // used to calculate values from meta
    const calc = (value) => (
      value && value.__calc ? value.get(meta) : value
    );

    // optional meta
    meta.player = action.player &&
      getPlayer(state, calc(action.player).token) || action.player;
    meta.property = action.property &&
      getProperty(state, calc(action.property).id);
    meta.group = action.property &&
      getProperties(state, meta.property.group);
    meta.properties = action.properties &&
      calc(action.properties).map((id) => getProperty(state, id));
    meta.other = action.other &&
      getPlayer(state, calc(action.other).token);

    // run action calculations and build remaining meta
    action = Object.keys(action).reduce((a, k) => {
      a[k] = calc(a[k]);
      if (k !== 'type' && !meta.hasOwnProperty(k))
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
