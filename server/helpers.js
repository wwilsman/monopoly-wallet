/**
 * Finds a player in the game state
 * @param {Object} state - Game state
 * @param {String} token - Player token
 * @returns {Object} Player data
 */
export function getPlayer(state, token) {
  return state && state.players[token];
}

/**
 * Finds a property in the game state
 * @param {Object} state - Game state
 * @param {String} id - Property ID
 * @returns {Object} Property data
 */
export function getProperty(state, id) {
  return state && state.properties[id];
}

/**
 * Finds properties by group in the game state
 * @param {Object} state - Game state
 * @param {String} group - Property group
 * @returns {[Object]} Array of property data
 */
export function getProperties(state, group) {
  return state && state.properties._all
    .filter((id) => state.properties[id].group === group)
    .map((id) => state.properties[id]);
}

/**
 * Generates a trade ID from player tokens
 * @param {String} playerToken - Player token
 * @param {String} otherToken - Other player's token
 * @returns {String} Trade ID
 */
export function getTradeId(playerToken, otherToken) {
  return [playerToken, otherToken].sort().join('--');
}

/**
 * Finds a trade in the game state
 * @param {Object} state - Game state
 * @param {String} tradeId - Trade ID
 * @returns {Object} Trade data
 */
export function getTrade(state, tradeId) {
  return state && state.trades[tradeId];
}

/**
 * Creates a property for actions to calculate a value within the rule middleware
 * @param {Function} get - Function to return a value from the rule meta
 */
export function calc(get) {
  return { __calc: true, get };
}
