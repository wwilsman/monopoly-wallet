import { throwError } from './error';

/**
 * Validates a player's token is unique
 * @param {Object} state - Current game state
 * @param {String} player.token - Player token
 * @throws {MonopolyError}
 */
export const uniqueToken = ({ state, player }) => {
  state.players[player.token] && throwError('Token already in use');
};

/**
 * Validates a player exists in the game state
 * @param {Object} state - Current game state
 * @param {String} player.token - Player token
 * @param {String} [other.token] - Other player's token
 * @throws {MonopolyError}
 */
export const playerExists = ({ state, player, other }) => {
  (player.token !== 'bank' && !state.players[player.token]) &&
    throwError(`Cannot find player with token ${player.token}`);
  (other && other.token !== 'bank' && !state.players[other.token]) &&
    throwError(`Cannot find player with token ${other.token}`);
};

/**
 * Validates a player has a sufficient balance
 * @param {Number} amount - Amount needed
 * @param {Number} player.balance - Player's balance
 * @param {Number} [other.balance] - Other player's balance
 * @throws {MonopolyError}
 */
export const sufficientBalance = ({ amount, player, other }) => {
  player.balance < amount && throwError('Insufficient balance');
  (other && other.balance < Math.abs(amount)) &&
    throwError(`${other.name} has an insufficient balance`);
};
