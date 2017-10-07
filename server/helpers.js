import slug from 'slug';

/**
 * Generates a random string of characters
 * @param {Number} length - Length of string
 * @returns {String} Random string
 */
export function randomString(length = 5) {
  const possible = 'ABCDEFHIGKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';


  for (let i = 0; i < length; i++) {
    const rand = Math.floor(Math.random() * possible.length);
    result += possible.charAt(rand);
  }

  return result;
}

/**
 * Creates a new game state from property data and game config
 * @param {[Object]} properties - Array of initial property data
 * @param {Object} config - Game config options
 * @returns {Object} Newly created game state
 */
export function createGameState(properties, config) {
  return {
    bank: config.bankStart < 0 ? Infinity : config.bankStart,
    houses: config.houseCount,
    hotels: config.hotelCount,
    players: { _all: [] },
    trades: {},

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

/**
 * Generates a notice by id from passed data
 * @param {String} id - Notice path from notices.yml
 * @param {Object} [data] - Data used in the notice
 * @param {Object} notices - Notices from notices.yml
 * @returns {String} A generated notice
 */
export function generateNotice(id, data, notices = data) {
  const message = get(id, notices);
  return !message ? id : !data ? message : message
    .replace(/{{([\w.]+?)}}/g, (_, key) => get(key, data));
}

/**
 * Gets a nested value from nested objects
 * @param {String} path - Nested key to get
 * @param {Object} object - Object to traverse
 * @returns {Mixed} Value of path in object
 */
function get(path, object) {
  return path.split('.').reduce((parent, key) => {
    return parent ? parent[key] : undefined;
  }, object);
}
