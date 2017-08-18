import { calc } from '../helpers';

export const AUCTION_PROPERTY = 'AUCTION_PROPERTY';
export const PLACE_BID = 'PLACE_BID';
export const CONCEDE_AUCTION = 'CONCEDE_AUCTION';
export const CANCEL_AUCTION = 'CANCEL_AUCTION';
export const CLOSE_AUCTION = 'CLOSE_AUCTION';

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
  players: calc(({ state }) => state.players._all),
  notice: { id: 'auction.start' }
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
  property: calc(({ auction }) => ({ id: auction.property })),
  notice: { id: 'auction.bid' },
  amount
});

/**
 * Action creator for conceding from an auction
 * @param {String} playerToken - Player token
 * @returns {Object} Redux action
 */
export const concedeAuction = (playerToken) => ({
  type: calc(({ auction }) => (
    (auction && auction.players.length === 1 &&
     auction.players.indexOf(playerToken) === 0) ?
      CANCEL_AUCTION : CONCEDE_AUCTION
  )),
  player: { token: playerToken },
  property: calc(({ auction }) => ({ id: auction.property })),
  notice: calc(({ auction }) => ({
    id: (auction.players.length === 1 &&
         auction.players.indexOf(playerToken) === 0) ?
      'auction.cancelled' : 'auction.conceded'
  }))
});

/**
 * Action creator for closing an auction
 * @returns {Object} Redux action
 */
export const closeAuction = () => ({
  type: calc(({ auction }) => auction.winning ? CLOSE_AUCTION : CANCEL_AUCTION),
  player: calc(({ auction }) => ({ token: auction.winning })),
  property: calc(({ auction }) => ({ id: auction.property })),
  amount: calc(({ auction }) => auction.amount),
  notice: calc(({ auction }) => ({
    id: auction.winning ? 'auction.won' : 'auction.cancelled'
  }))
});
