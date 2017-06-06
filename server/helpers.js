/**
 * Finds a player in the game state
 * @param {Object} state - Game state
 * @param {String} id - Player ID
 * @returns {Object} Player data
 */
export function getPlayer(state, id) {
  return state.players.find((player) => {
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
  return state.properties.find((property) => {
    return property.id === id;
  });
}
