/**
 * Validates an auction is not currently active
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.auction - Auction selector
 * @throws {MonopolyError}
 */
export const noCurrentAuction = (_, error, select) => {
  if (select.auction()) {
    throw error('auction.in-progress');
  }
};

/**
 * Validates an auction is not currently active
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.auction - Auction selector
 * @throws {MonopolyError}
 */
export const auctionInProgress = (_, error, select) => {
  if (!select.auction()) {
    throw error('auction.not-in-progress');
  }
};

/**
 * Validates a player is not winning the auction
 * @param {String} player.token - Player token
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.auction - Auction selector
 * @throws {MonopolyError}
 */
export const notWinningAuction = ({ player }, error, select) => {
  let auction = select.auction();

  if (auction && auction.winning === player.token) {
    throw error('auction.winning');
  }
};

/**
 * Validates a property is not up for auction
 * @param {String} property.id - Property ID
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.auction - Auction selector
 * @throws {MonopolyError}
 */
export const propertyNotForAuction = ({ property }, error, select) => {
  let auction = select.auction();

  if (auction && auction.property === property.id) {
    throw error('auction.property');
  }
};

/**
 * Validates a player is involved in the auction
 * @param {String} player.token - Player token
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.auction - Auction selector
 * @throws {MonopolyError}
 */
export const playerInAuction = ({ player }, error, select) => {
  let auction = select.auction();

  if (!auction || auction.players.indexOf(player.token) === -1) {
    throw error('auction.not-involved');
  }
};

/**
 * Validates an auction bid is higher than the current bid
 * @param {Number} amount - Amount to bid
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.auction - Auction selector
 * @throws {MonopolyError}
 */
export const bidHigherThan = ({ amount }, error, select)  => {
  let auction = select.auction();

  if (auction && auction.amount >= amount) {
    throw error('auction.bid-higher');
  }
};
