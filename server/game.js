import {
  applyMiddleware,
  createStore,
  compose
} from 'redux';

import gameReducer from './reducers';
import ruleMiddleware from './rules';

export function createState(state, config) {
  return state.id ? state : {
    ...state,
    properties: state.properties.map((property) => ({
      ...property,
      owner: 'bank'
    }))
  };
}

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
    createState(initialState, config),
    applyMiddleware(
      ruleMiddleware(config)
    )
  );

  return store;
}
