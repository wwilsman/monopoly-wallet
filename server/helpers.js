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
 * Generates a trade ID from player tokens
 * @param {String} playerToken - Player token
 * @param {String} otherToken - Other player's token
 * @returns {String} Trade ID
 */
export function getTradeId(playerToken, otherToken) {
  return [playerToken, otherToken].sort().join('--');
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
export function get(path, object) {
  return path.split('.').reduce((parent, key) => {
    return parent ? parent[key] : undefined;
  }, object);
}
