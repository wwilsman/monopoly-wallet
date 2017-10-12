/**
 * Validates a player's token is valid
 * @param {String} player.token - Player token
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.config - Config selector
 * @throws {MonopolyError}
 */
export const allowedToken = ({ player }, error, select) => {
  let tokens = select.config('playerTokens');

  if (tokens.indexOf(player.token) === -1) {
    throw error('player.missing-token');
  }
};

/**
 * Validates a player's token is unique
 * @param {String} player.token - Player token
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.player - Player selector
 * @throws {MonopolyError}
 */
export const uniqueToken = ({ player }, error, select) => {
  if (select.player(player.token)) {
    throw error('player.used-token');
  }
};

/**
 * Validates a player exists in the game state
 * @param {String} player.token - Player token
 * @param {String} [other.token] - Other player's token
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.player - State selector
 * @throws {MonopolyError}
 */
export const playerExists = ({ player, other }, error, select) => {
  let exists = (token) => !!select.player(token);

  if (player.token !== 'bank' && !exists(player.token)) {
    throw error('player.not-found');
  } else if (other && other.token !== 'bank' && !exists(other.token)) {
    throw error('player.not-found', { player: other });
  }
};

/**
 * Validates a player has a sufficient balance
 * @param {Number} player.balance - Player's balance
 * @param {Number} [other.balance] - Other player's balance
 * @param {Number} amount - Amount needed
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const sufficientBalance = ({ player, other, amount }, error) => {
  if (player.balance < amount) {
    throw error('player.balance');
  } else if (other && other.balance < Math.abs(amount)) {
    throw error('player.other-balance');
  }
};
