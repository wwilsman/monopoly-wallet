export const JOIN_GAME = 'JOIN_GAME';
export const BUY_PROPERTY = 'BUY_PROPERTY';
export const MAKE_TRANSFER_TO = 'MAKE_TRANSFER_TO';
export const MAKE_TRANSFER_FROM = 'MAKE_TRANSFER_FROM';
export const MAKE_TRANSFER_WITH = 'MAKE_TRANSFER_WITH';
export const IMPROVE_PROPERTY = 'IMPROVE_PROPERTY';

/**
 * Creates a property for actions to calculate a value within the rule middleware
 * @param {Function} get - Function to return a value from the rule meta
 */
export const calc = (get) => ({ __calc: true, get });

/**
 * Action creator for joining a game
 * @param {String} name - Player name
 * @param {String} token - Player token
 * @returns {Object} Redux action
 */
export const join = (name, token) => ({
  type: JOIN_GAME,
  player: { name, token },
  amount: calc(({ config }) => config.playerStart)
});

/**
 * Action creator for buying property
 * @param {String} playerId - Player ID
 * @param {String} propertyId - Property ID
 * @param {Number} [amount] - Optional amount defaults to property price
 * @returns {Object} Redux action
 */
export const buyProperty = (playerId, propertyId, amount) => ({
  type: BUY_PROPERTY,
  player: { id: playerId },
  property: { id: propertyId },
  amount: typeof amount !== 'undefined' ? amount :
    calc(({ property }) => property.price)
});

/**
 * Action creator for transfers
 * Omitting `otherId` will make a transfer to/from the bank
 * @param {String} playerId - Player ID
 * @param {String} [otherId] - Other player's ID
 * @param {Number} amount - Amount to transfer (+/- for bank transfers)
 * @returns {Object} Redux action
 */
export const makeTransfer = (playerId, otherId, amount = otherId) => {
  let actionType = MAKE_TRANSFER_WITH;

  if (otherId === amount) {
    actionType = amount > 0 ?
      MAKE_TRANSFER_TO :
      MAKE_TRANSFER_FROM;
    amount = Math.abs(amount);
    otherId = null;
  }

  return {
    type: actionType,
    player: { id: playerId },
    other: { id: otherId },
    amount
  };
};

/**
 * Action creator for improving a property
 * @param {String} playerId - Player ID
 * @param {String} propertyId - Property ID
 * @returns {Object} Redux action
 */
export const improveProperty = (playerId, propertyId) => ({
  type: IMPROVE_PROPERTY,
  player: { id: playerId },
  property: { id: propertyId },
  houses: calc(({ property }) => property.buildings === 4 ? -4 : 1),
  hotels: calc(({ property }) => property.buildings === 4 ? 1 : 0),
  amount: calc(({ property }) => property.cost)
});
