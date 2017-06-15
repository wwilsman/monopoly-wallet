/**
 * Validates the bank has sufficient funds
 * @param {Object} state - Current game state
 * @param {Number} amount - Amount needed
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const bankHasFunds = ({ state, amount }, throwError) => {
  amount > state.bank && throwError('common.bank-low');
};

/**
 * Validates a needed amount is not negative
 * @param {Number} amount - Amount needed
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const negativeAmount = ({ amount }, throwError) => {
  amount < 0 && throwError('common.negative-amount');
};
