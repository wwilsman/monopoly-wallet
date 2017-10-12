import { generateNotice } from './helpers';
import MonopolyError from './error';

/**
 * Middleware to gather additional data for actions and run them against
 * sets of rules before dispatching
 * @param {Object} rules - Game rules
 * @param {Object} selectors - Selectors to use with actions / rules
 * @param {Object} notices - Map of game notices
 * @returns {Function} Middleware to be used with `applyMiddleware`
 */
export default ({ rules, selectors, notices }) => {
  return (store) => (next) => (action) => {
    let state = store.getState();

    // bind the current state to all selectors
    let select = Object.keys(selectors).reduce((all, name) => ({
      [name]: (...args) => selectors[name](state, ...args),
      ...all
    }), {});

    // calculate an action using the selectors
    if (typeof action === 'function') {
      action = action(select);
    }

    // helper to return meta for specific action properties
    let lookup = (key) => {
      switch (key) {
        case 'player': return select.player(action.player.token);
        case 'other': return select.player(action.other.token);
        case 'property': return select.property(action.property.id);
        case 'properties': return action.properties.map(select.property);
        case 'trade': return select.trade(action.trade.id);
      }
    };

    // gather meta data about the action
    let meta = Object.keys(action).reduce((m, key) => {
      return { ...m, [key]: lookup(key) || action[key] };
    }, {});

    // check against action type rules
    if (rules[action.type]) {
      /**
       * Rule helper to create a MonopolyError by ID
       * @param {String} id - Error ID
       * @param {Object} overrides - meta overrides
       * @returns {MonopolyError}
       */
      let error = (id, overrides = {}) => new MonopolyError(
        generateNotice(`errors.${id}`, {
          ...meta,
          ...overrides
        }, notices)
      );

      // test all of the rules
      for (let test of rules[action.type]) {
        test(meta, error, select);
      }
    }

    // generate a notice message
    if (action.notice) {
      let id = `notices.${action.notice.id}`;
      action.notice.message = generateNotice(id, meta, notices);
    }

    // continue to dispatch
    return next(action);
  };
};
