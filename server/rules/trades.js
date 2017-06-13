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
