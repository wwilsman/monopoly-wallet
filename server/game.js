import {
  applyMiddleware,
  createStore,
  compose
} from 'redux';

import gameReducer from './reducers';
import ruleMiddleware from './rules';

/**
 * Creates a new store instance for games
 * @param {Object} state - Initial game state
 * @param {Object} config - Game config options
 * @returns {Object} Redux Store object
 */
export default (initialState, config) => {
  const reducer = (state, action) =>
    gameReducer(state, action, config);

  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(
      ruleMiddleware(config)
    )
  );

  return store;
}
