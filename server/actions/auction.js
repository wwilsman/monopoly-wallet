import { calc } from '../helpers';

export const AUCTION_PROPERTY = 'AUCTION_PROPERTY';

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
