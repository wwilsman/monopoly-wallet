import { error, withError } from '../../error';

// checks if an amount is an integer to prevent the game getting into weird states
export function isInteger(amount) {
  return withError(() => {
    if (!Number.isInteger(amount)) {
      throw error('common.amount-type', { amount });
    }
  });
}

// checks if an amount is not negative
export function isNotNegative(amount) {
  return withError(() => {
    if (amount < 0) {
      throw error('common.negative-amount', { amount });
    }
  });
}
