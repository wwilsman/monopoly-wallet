import { throwError } from './error';
import { JOIN_GAME } from '../actions';
import { bankFunds } from './common';

/**
 * Validates a player's token is unique
 * @param {String} player.token - Player token
 * @param {Object} state - Current game state
 * @throws {MonopolyError}
 */
export const uniqueToken = ({ player, state }) => {
  state.players.some((pl) => pl.token === player.token) &&
    throwError('Token already in use');
};

// Rules for joining
export default {
  [JOIN_GAME]: [
    uniqueToken,
    bankFunds
  ]
};
