import { getTradeId, calc } from '../helpers';

export const MAKE_OFFER = 'MAKE_OFFER';
export const DECLINE_OFFER = 'DECLINE_OFFER';
export const ACCEPT_OFFER = 'ACCEPT_OFFER';

/**
 * Action creator to initiate a trade with another player
 * @param {String} playerToken - Player token
 * @param {String} otherToken - Other player's token
 * @param {[String]} [trade.properties=[]] - Array of property IDs to trade
 * @param {Number} [trade.amount=0]  - Amount to trade
 * @returns {Object} Redux action
 */
export const makeOffer = (playerToken, otherToken, {
  properties = [],
  amount = 0
}) => ({
  type: MAKE_OFFER,
  player: { token: playerToken },
  other: { token: otherToken },
  trade: { id: getTradeId(playerToken, otherToken) },
  properties,
  amount
});

/**
 * Action creator to decline a trade with another player
 * @param {String} playerToken - Player token
 * @param {String} otherToken - Other player's token
 * @returns {Object} Redux action
 */
export const declineOffer = (playerToken, otherToken) => ({
  type: DECLINE_OFFER,
  player: { token: playerToken },
  other: { token: otherToken },
  trade: { id: getTradeId(playerToken, otherToken) }
});

/**
 * Action creator to accept a trade with another player
 * @param {String} playerToken - Player token
 * @param {String} otherToken - Other player's token
 * @returns {Object} Redux action
 */
export const acceptOffer = (playerToken, otherToken) => ({
  type: ACCEPT_OFFER,
  player: { token: playerToken },
  other: { token: otherToken },
  trade: { id: getTradeId(playerToken, otherToken) },
  properties: calc(({ trade }) => trade.properties),
  amount: calc(({ trade }) => -trade.amount)
});
