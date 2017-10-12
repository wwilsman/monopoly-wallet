import { createSelector } from 'reselect';
import { get } from './helpers';

/**
 * Creates a selector that returns the nth argument
 * @param {Number} n - index of the argument
 * @returns {Mixed} Argument at index
 */
const nth = (n) => (...args) => args[n];

/**
 * Creates memoized selectors for a game
 * @param {Object} conf - Game config
 * @returns {Object} Selector
 */
export default (conf = {}) => {
  /**
   * Selector to simply return any state value
   * @param {Object} state - Game state
   * @param {String} key - Config key
   * @returns {Object} Game config
   */
  const state = (state, key) => get(key, state);

  /**
   * Selector to simply return a config value
   * @param {Object} state - Game state
   * @param {String} key - Config key
   * @returns {Object} Game config
   */
  const config = (state, key) => get(key, conf);

  /**
   * Selects a player in the game state
   * @param {Object} state - Game state
   * @param {String} token - Player token
   * @returns {Object} Player data
   */
  const player = (state, token) => state.players[token];

  /**
   * Selects a property in the game state
   * @param {Object} state - Game state
   * @param {String} id - Property ID
   * @returns {Object} Property data
   */
  const property = (state, id) => state.properties[id];

  /**
   * Selects all properties as an array
   * @param {Object} state - Game state
   * @returns {[Object]} Array of property data
   */
  const properties = createSelector(
    (state) => state.properties,
    (props) => props._all.map((id) => props[id])
  );

  /**
   * Selects all properties owned by a player
   * @param {Object} state - Game state
   * @param {String} token - Player token
   * @returns {[Object]} Array of property data
   */
  const owned = createSelector(
    [properties, nth(1)],
    (props, token) => props.filter((p) => p.owner === token)
  );

  /**
   * Selects properties by group in the game state
   * @param {Object} state - Game state
   * @param {String} group - Property group
   * @returns {[Object]} Array of property data
   */
  const group = createSelector(
    [properties, nth(1)],
    (props, group) => props.filter((p) => p.group === group)
  );

  /**
   * Selects a trade in the game state
   * @param {Object} state - Game state
   * @param {String} id - Trade ID
   * @returns {Object} Trade data
   */
  const trade = (state, id) => state.trades[id];

  /**
   * Selects the auction in the game state
   * @param {Object} state - Game state
   * @returns {Object} Auction data
   */
  const auction = (state) => state.auction;

  // all selectors
  return {
    state,
    config,
    player,
    property,
    properties,
    owned,
    group,
    trade,
    auction
  };
};
