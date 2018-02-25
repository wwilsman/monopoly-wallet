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
export const auctionProperty = (playerToken, propertyId) => {
  return (select) => ({
    type: AUCTION_PROPERTY,
    player: { token: playerToken },
    property: { id: propertyId },
    players: select.state('players._all'),
    notice: { id: 'auction.start' }
  });
};

/**
 * Action creator for bidding in an auction
 * @param {String} playerToken - Player token
 * @param {Number} amount - Amount to bid
 * @returns {Object} Redux action
 */
export const placeBid = (playerToken, amount) => {
  return (select) => ({
    type: PLACE_BID,
    player: { token: playerToken },
    property: { id: select.state('auction.property') },
    notice: { id: 'auction.bid' },
    amount
  });
};

/**
 * Action creator for conceding from an auction
 * @param {String} playerToken - Player token
 * @returns {Object} Redux action
 */
export const concedeAuction = (playerToken) => {
  return (select) => {
    let auction = select.auction();
    let last = auction &&
      auction.players.length === 1 &&
      auction.players[0] === playerToken;

    if (auction && !last) {
      return {
        type: CONCEDE_AUCTION,
        player: { token: playerToken },
        property: { id: auction.property },
        notice: { id: 'auction.conceded' }
      };
    } else {
      return {
        type: CANCEL_AUCTION,
        player: { token: playerToken },
        property: auction && { id: auction.property },
        notice: { id: 'auction.cancelled' }
      };
    }
  };
};

/**
 * Action creator for closing an auction
 * @returns {Object} Redux action
 */
export const closeAuction = (playerToken) => {
  return (select) => {
    let auction = select.auction();

    if (auction && auction.winning) {
      let property = select.property(auction.property);
      let group = property.group;

      let monopoly = select.group(group).every((pr) => (
        pr.owner === auction.winning || pr.id === auction.property
      ));

      return {
        type: CLOSE_AUCTION,
        player: { token: auction.winning },
        property: { id: auction.property, group, monopoly },
        amount: auction.amount,
        notice: { id: 'auction.won' }
      };
    } else {
      return {
        type: CANCEL_AUCTION,
        player: { token: playerToken },
        property: auction && { id: auction.property },
        notice: { id: 'auction.cancelled' }
      };
    }
  };
};
