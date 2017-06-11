import { throwError } from './error';

/**
 * Validates a player's token is unique
 * @param {String} player.token - Player token
 * @param {Object} state - Current game state
 * @throws {MonopolyError}
 */
export const uniqueToken = ({ state, player }) => {
  state.players.some((pl) => pl.token === player.token) &&
    throwError('Token already in use');
};

/**
 * Validates a player has a sufficient balance
 * @param {Number} player.balance - Player's balance
 * @param {Number} amount - Amount needed
 * @throws {MonopolyError}
 */
export const sufficientBalance = ({ player, amount }) => {
  player.balance < amount && throwError('Insufficient balance');
};
