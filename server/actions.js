import slug from 'slug';

export const JOIN_GAME = 'JOIN_GAME';
export const BUY_PROPERTY = 'BUY_PROPERTY';

/**
 * Action creator for joining a game
 * @param {String} name - Player name
 * @param {String} token - Player token
 * @returns {Object} Redux action
 */
export const join = (name, token) => ({
  type: JOIN_GAME,
  player: {
    id: slug(`${name}_${token}`),
    name,
    token
  }
});

/**
 * Action creator for buying property
 * @param {String} playerId - Player ID
 * @param {String} propertyId - Property ID
 * @param {Number} [amount] - Optional amount defaults to property price later
 * @returns {Object} Redux action
 */
export const buyProperty = (playerId, propertyId, amount) => ({
  type: BUY_PROPERTY,
  player: { id: playerId },
  property: { id: propertyId },
  amount
});
