export const MAKE_OFFER = 'MAKE_OFFER';

/**
 * Action create to initiate a trade with another player
 * @param {String} playerToken - Player token
 * @param {String} otherToken - Other player's token
 * @param {[String]} [trade.properties=[]] - Array of property IDs to trade
 * @param {Number} [trade.amount=0]  - Amount to trade
 */
export const makeOffer = (playerToken, otherToken, {
  properties = [],
  amount = 0
}) => ({
  type: MAKE_OFFER,
  player: { token: playerToken },
  other: { token: otherToken },
  properties,
  amount
});
