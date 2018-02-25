/**
 * Validates the bank has sufficient funds
 * @param {Number} amount - Amount needed
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.state - State selector
 * @throws {MonopolyError}
 */
export const bankHasFunds = ({ amount }, error, select) => {
  if (amount > select.state('bank')) {
    throw error('common.bank-low');
  }
};

/**
 * Validates a needed amount is not negative
 * @param {Number} amount - Amount needed
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const negativeAmount = ({ amount }, error) => {
  if (amount < 0) {
    throw error('common.negative-amount');
  }
};
