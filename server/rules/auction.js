/**
 * Validates an auction is not currently active
 * @param {Object} auction - Current active auction
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const noCurrentAuction = ({ auction }, throwError) => {
  auction && throwError('auction.in-progress');
};

/**
 * Validates an auction is not currently active
 * @param {Object} auction - Current active auction
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const auctionInProgress = ({ auction }, throwError) => {
  !auction && throwError('auction.not-in-progress');
};

/**
 * Validates a player is not winning the auction
 * @param {Object} auction - Current active auction
 * @param {String} player.token - Player token
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const notWinningAuction = ({ auction, player }, throwError) => {
  auction.winning === player.token && throwError('auction.winning');
};

/**
 * Validates a property is not up for auction
 * @param {Object} auction - Current active auction
 * @param {String} property.id - Property ID
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertyNotForAuction = ({ auction, property }, throwError) => {
  auction && auction.property === property.id && throwError('auction.property');
};

/**
 * Validates a player is involved in the auction
 * @param {Object} auction - Current active auction
 * @param {String} player.token - Player token
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const playerInAuction = ({ auction, player }, throwError) => {
  auction.players.indexOf(player.token) === -1 &&
    throwError('auction.not-involved');
};

/**
 * Validates an auction bid is higher than the current bid
 * @param {Object} auction - Current active auction
 * @param {Number} amount - Amount to bid
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const bidHigherThan = ({ auction, amount }, throwError)  => {
  auction.amount >= amount && throwError('auction.bid-higher');
};
