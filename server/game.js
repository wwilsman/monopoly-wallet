import { applyMiddleware, createStore } from 'redux';

import gameReducer from './reducers';
import ruleMiddleware from './rules/middleware';

/**
 * Creates a new store instance for games
 * @param {Object} initialState - Initial game state
 * @param {Object} config - Game config options
 * @param {Object} notices - Map of game notices
 * @returns {Object} Redux Store object
 */
export default (initialState, config, notices) => {
  const reducer = (state, action) =>
    gameReducer(state, action, config);

  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(
      ruleMiddleware(config, notices)
    )
  );

  return store;
};
