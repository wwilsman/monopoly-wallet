import { applyMiddleware, createStore } from 'redux';

import gameReducer from './reducers';

export const HYDRATE = 'HYDRATE';
export const hydrate = (state) => ({ type: HYDRATE, state });
import gameMiddleware from './middleware';
import gameRules from './rules';
import createSelectors from './selectors';

/**
 * Creates a new store instance for games
 * @param {Object} initialState - Initial game state
 * @param {Object} config - Game config options
 * @param {Object} notices - Map of game notices
 * @returns {Object} Redux Store object
 */
export default (initialState, config, notices) => {
  const reducer = (state, action) => {
    switch (action.type) {
      case HYDRATE:
        return gameReducer(action.state, action, config);
      default:
        return gameReducer(state, action, config);
    }
  };

  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(
      gameMiddleware({
        rules: gameRules,
        selectors: createSelectors(config),
        notices
      })
    )
  );

  return store;
};
