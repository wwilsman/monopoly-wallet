/**
 * Validates a trade exists
 * @param {String} trade - Trade data
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const tradeExists = ({ trade }, throwError) => {
  !trade && throwError('trade.not-found');
};

/**
 * Validates a trade is with the player
 * @param {String} trade - Trade data
 * @param {String} player.token - Player token
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const tradeIsWith = ({ trade, player }, throwError) => {
  trade.with !== player.token && throwError('trade.other-trade');
};
