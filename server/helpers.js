/**
 * Finds a player in the game state
 * @param {Object} state - Game state
 * @param {String} id - Player ID
 * @returns {Object} Player data
 */
export function getPlayer(state, id) {
  return state && state.players.find((player) => {
    return player.id === id;
  });
}

/**
 * Finds a property in the game state
 * @param {Object} state - Game state
 * @param {String} id - Property ID
 * @returns {Object} Property data
 */
export function getProperty(state, id) {
  return state && state.properties.find((property) => {
    return property.id === id;
  });
}

/**
 * Finds properties by group in the game state
 * @param {Object} state - Game state
 * @param {String} group - Property group
 * @returns {[Object]} Array of property data
 */
export function getProperties(state, group) {
  return state && state.properties.filter((property) => {
    return property.group === group;
  });
}

/**
 * Finds a trade by participating player IDs
 * @param {Object} state - Game state
 * @param {[String]} playerIds - Array of player IDs
 * @returns {Object} Trade data
 */
export function getTrade(state, playerIds) {
  return state && state.trades.find((trade) => {
    return trade.players.indexOf(playerIds[0]) > -1 &&
      trade.players.indexOf(playerIds[1]) > -1;
  });
}

/**
 * Creates a property for actions to calculate a value within the rule middleware
 * @param {Function} get - Function to return a value from the rule meta
 */
export function calc(get) {
  return { __calc: true, get };
}
