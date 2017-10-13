import { getTradeId } from '../helpers';

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
export const makeOffer = (playerToken, otherToken, trade) => {
  return (select) => {
    let tradeId = getTradeId(playerToken, otherToken);

    return {
      type: MAKE_OFFER,
      player: { token: playerToken },
      other: { token: otherToken },
      trade: { id: tradeId },
      properties: (trade.properties||[]).map((id) => ({ id })),
      amount: trade.amount || 0,
      notice: {
        id: select.trade(tradeId)
          ? 'trade.modified'
          : 'trade.new'
      }
    };
  };
};

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
  trade: { id: getTradeId(playerToken, otherToken) },
  notice: { id: 'trade.declined' }
});

/**
 * Action creator to accept a trade with another player
 * @param {String} playerToken - Player token
 * @param {String} otherToken - Other player's token
 * @returns {Object} Redux action
 */
export const acceptOffer = (playerToken, otherToken) => {
  return (select) => {
    let tradeId = getTradeId(playerToken, otherToken);
    let trade = select.trade(tradeId);

    return {
      type: ACCEPT_OFFER,
      player: { token: playerToken },
      other: { token: otherToken },
      trade: { id: tradeId },
      properties: trade ? trade.properties.map((id, i, props) => {
        let property = select.property(id);
        let newOwner = property.owner === playerToken ? otherToken : playerToken;
        let monopoly = select.group(property.group).every((pr) => (
          pr.owner === newOwner || (
            pr.owner === property.owner &&
              props.includes(pr.id)
          )
        ));

        return { id, monopoly };
      }) : [],
      amount: trade ? -trade.amount : 0,
      notice: { id: 'trade.accepted'}
    };
  };
};
