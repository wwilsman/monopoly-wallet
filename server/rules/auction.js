import { throwError } from './error';

/**
 * Validates an auction is not currently active
 * @param {Object} auction - Current active auction
 * @throws {MonopolyError}
 */
export const noCurrentAuction = ({ auction }) => {
  auction && throwError('Auction in progress');
};

/**
 * Validates an auction is not currently active
 * @param {Object} auction - Current active auction
 * @throws {MonopolyError}
 */
export const auctionInProgress = ({ auction }) => {
  !auction && throwError('No current auction in progress');
};

/**
 * Validates a player is not winning the auction
 * @param {Object} auction - Current active auction
 * @param {String} player.token - Player token
 * @throws {MonopolyError}
 */
export const notWinningAuction = ({ auction, player }) => {
  auction.winning === player.token &&
    throwError('You are already winning the auction');
};

/**
 * Validates a property is not up for auction
 * @param {Object} auction - Current active auction
 * @param {String} property.id - Property ID
 * @throws {MonopolyError}
 */
export const propertyNotForAuction = ({ auction, property }) => {
  auction && auction.property === property.id &&
    throwError(`${property.name} is up for auction`);
};

/**
 * Validates a player is involved in the auction
 * @param {Object} auction - Current active auction
 * @param {String} player.token - Player token
 * @throws {MonopolyError}
 */
export const playerInAuction = ({ auction, player }) => {
  auction.players.indexOf(player.token) === -1 &&
    throwError('You are not involved in the auction');
};

/**
 * Validates an auction bid is higher than the current bid
 * @param {Object} auction - Current active auction
 * @param {Number} amount - Amount to bid
 * @throws {MonopolyError}
 */
export const bidHigherThan = ({ auction, amount }) => {
  auction.amount >= amount && throwError('Must bid higher than current bid');
};
