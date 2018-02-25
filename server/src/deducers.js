import { createDeducer } from 'redux-deep-diff';

/**
 * Gets players balance histories from the state history
 * @param {Object} state - current game state
 * @returns {Object} player balance histories
 */
export const getPlayerHistories = (state) => {
  return state.players._all.reduce((history, token) => {
    let getBalanceHistory = createDeducer(({ players }) => {
      return players[token] && players[token].balance;
    }, { unique: true });

    let balanceHistory = getBalanceHistory(state)
      .filter((bal) => typeof bal === 'number');

    // using unique above wil not prevent the deducer from returning
    // the current value if it hasn't changed since the last diff
    if (balanceHistory.slice(-1, 1)[0] === state.players[token].balance) {
      balanceHistory.splice(-1, 1);
    }

    return { ...history, [token]: balanceHistory };
  }, {});
};
