import { throwError } from './error';

/**
 * Validates the bank has sufficient funds
 * @param {Number} needed.amount - Amount needed
 * @param {Object} state - Current game state
 * @throws {MonopolyError}
 */
export const bankFunds = ({ needed, state }) => {
  needed.amount > state.bank &&
    throwError('Bank funds are insufficient');
};
