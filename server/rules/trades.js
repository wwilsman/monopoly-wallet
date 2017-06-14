import { throwError } from './error';

/**
 * Validates a trade exists
 * @param {String} trade - Trade data
 * @param {String} other.name - Other player's name
 * @throws {MonopolyError}
 */
export const tradeExists = ({ trade, other }) => {
  !trade && throwError(`Cannot find offer with ${other.name}`);
};

/**
 * Validates a trade is with the player
 * @param {String} trade - Trade data
 * @param {String} player.token - Player token
 * @throws {MonopolyError}
 */
export const tradeIsWith = ({ trade, player }) => {
  trade.with !== player.token && throwError('Cannot accept other offers');
};
