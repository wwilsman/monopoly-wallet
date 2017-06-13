import slug from 'slug';
import { applyMiddleware, createStore } from 'redux';

import gameReducer from './reducers';
import ruleMiddleware from './rules/middleware';

/**
 * Creates a new game state from an initial state and config
 * @param {[Object]} properties - Array of initial property data
 * @param {Object} config - Game config options
 * @returns {Object} Newly created game state
 */
export function createState(properties, config) {
  return {
    bank: config.bankStart < 0 ? Infinity : config.bankStart,
    houses: config.houseCount,
    hotels: config.hotelCount,
    players: {},
    trades: [],

    properties: properties.reduce((map, property) => {
      const id = slug(property.name, { lower: true });

      map[id] = {
        ...property,
        mortgaged: false,
        buildings: 0,
        owner: 'bank',
        id
      };

      map._all.push(id);
      return map;
    }, { _all: [] })
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
