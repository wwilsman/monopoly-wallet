import { calc } from '../helpers';

export const AUCTION_PROPERTY = 'AUCTION_PROPERTY';
export const PLACE_BID = 'PLACE_BID';

/**
 * Action creator for auctioning properties
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @returns {Object} Redux action
 */
export const auctionProperty = (playerToken, propertyId) => ({
  type: AUCTION_PROPERTY,
  player: { token: playerToken },
  property: { id: propertyId },
  players: calc(({ state }) => Object.keys(state.players))
});

/**
 * Action creator for bidding in an auction
 * @param {String} playerToken - Player token
 * @param {Number} amount - Amount to bid
 * @returns {Object} Redux action
 */
export const placeBid = (playerToken, amount) => ({
  type: PLACE_BID,
  player: { token: playerToken },
  amount
});
