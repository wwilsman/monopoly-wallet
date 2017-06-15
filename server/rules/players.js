/**
 * Validates a player's token is unique
 * @param {Object} state - Current game state
 * @param {String} player.token - Player token
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const uniqueToken = ({ state, player }, throwError) => {
  state.players[player.token] && throwError('player.used-token');
};

/**
 * Validates a player exists in the game state
 * @param {Object} state - Current game state
 * @param {String} player.token - Player token
 * @param {String} [other.token] - Other player's token
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const playerExists = ({ state, player, other }, throwError) => {
  (player.token !== 'bank' && !state.players[player.token]) &&
    throwError('player.not-found');
  (other && other.token !== 'bank' && !state.players[other.token]) &&
    throwError('player.not-found', { player: other });
};

/**
 * Validates a player has a sufficient balance
 * @param {Number} amount - Amount needed
 * @param {Number} player.balance - Player's balance
 * @param {Number} [other.balance] - Other player's balance
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const sufficientBalance = ({ amount, player, other }, throwError) => {
  player.balance < amount && throwError('player.balance');
  (other && other.balance < Math.abs(amount)) && throwError('player.other-balance');
};
