export const MAKE_OFFER = 'MAKE_OFFER';

/**
 * Action create to initiate a trade with another player
 * @param {String} playerId - Player ID
 * @param {String} otherId - Other player's ID
 * @param {[String]} [trade.properties=[]] - Array of property IDs to trade
 * @param {Number} [trade.amount=0]  - Amount to trade
 */
export const makeOffer = (playerId, otherId, {
  properties = [],
  amount = 0
}) => ({
  type: MAKE_OFFER,
  player: { id: playerId },
  other: { id: otherId },
  properties,
  amount
});
