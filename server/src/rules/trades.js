/**
 * Validates a trade exists
 * @param {String} trade - Trade data
 * @param {Function} error - Creats a monopoly error
 * @throws {MonopolyError}
 */
export const tradeExists = ({ trade }, error) => {
  if (!trade.from || !trade.with) {
    throw error('trade.not-found');
  }
};

/**
 * Validates a trade is with the player
 * @param {String} player.token - Player token
 * @param {Object} trade - Trade data
 * @param {Function} error - Creats a monopoly error
 * @throws {MonopolyError}
 */
export const tradeIsWith = ({ player, trade }, error) => {
  if (trade.with !== player.token) {
    throw error('trade.other-trade');
  }
};
