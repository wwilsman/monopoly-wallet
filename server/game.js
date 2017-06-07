import slug from 'slug';
import {
  applyMiddleware,
  createStore,
  compose
} from 'redux';

import gameReducer from './reducers';
import ruleMiddleware from './rules';

/**
 * Creates a new game state from an initial state and config
 * @param {Object} state - Initial game state
 * @param {Object} config - Game config options
 * @returns {Object} Newly created game state
 */
export function createState(state, config) {
  return {
    bank: config.bankStart < 0 ? Infinity : config.bankStart,
    houses: config.houseCount,
    hotel: config.hotelCount,
    players: [],
    ...state,

    properties: state.properties.map((property) => ({
      id: slug(property.name, { lower: true }),
      buildings: 0,
      owner: 'bank',
      mortgaged: false,
      ...property
    }))
  };
}

/**
 * Creates a new store instance for games
 * @param {Object} initialState - Initial game state
 * @param {Object} config - Game config options
 * @returns {Object} Redux Store object
 */
export function createGame(initialState, config) {
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
