import { throwError } from './error';

/**
 * Validates the bank has sufficient funds
 * @param {Object} state - Current game state
 * @param {Number} amount - Amount needed
 * @throws {MonopolyError}
 */
export const bankHasFunds = ({ state, amount }) => {
  amount > state.bank && throwError('Bank funds are insufficient');
};

/**
 * Validates a needed amount is not negative
 * @param {Number} amount - Amount needed
 * @throws {MonopolyError}
 */
export const negativeAmount = ({ amount }) => {
  amount < 0 && throwError('Amount must not be negative');
};
