import { throwError } from './error';

/**
 * Validates the bank has sufficient funds
 * @param {Number} amount - Amount needed
 * @throws {MonopolyError}
 */
export const bankFunds = (state, { amount }) => {
  amount > state.bank && throwError('Bank funds are insufficient');
};

/**
 * Validates a needed amount is not negative
 * @param {Number} amount - Amount needed
 * @throws {MonopolyError}
 */
export const negativeAmount = (state, { amount }) => {
  amount < 0 && throwError('Amount must not be negative');
};
