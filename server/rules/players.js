import {
  throwError
} from './error';
import {
  bankFunds,
  negativeAmount
} from './common';
import {
  JOIN_GAME,
  MAKE_TRANSFER_TO,
  MAKE_TRANSFER_FROM,
  MAKE_TRANSFER_WITH,
} from '../actions';

/**
 * Validates a player's token is unique
 * @param {String} player.token - Player token
 * @throws {MonopolyError}
 */
export const uniqueToken = (state, { player }) => {
  state.players.some((pl) => pl.token === player.token) &&
    throwError('Token already in use');
};

/**
 * Validates a player has a sufficient balance
 * @param {Number} player.balance - Player's balance
 * @param {Number} amount - Amount needed
 * @throws {MonopolyError}
 */
export const sufficientBalance = (state, { player, amount }) => {
  player.balance < amount && throwError('Insufficient balance');
};

// Rules for players
export default {
  [JOIN_GAME]: [
    uniqueToken,
    bankFunds
  ],
  [MAKE_TRANSFER_TO]: [
    bankFunds
  ],
  [MAKE_TRANSFER_FROM]: [
    sufficientBalance
  ],
  [MAKE_TRANSFER_WITH]: [
    negativeAmount,
    sufficientBalance
  ]
};
