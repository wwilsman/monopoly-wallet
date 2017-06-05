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
 * @param {Object} state - Current game state
 * @throws {MonopolyError}
 */
export const uniqueToken = ({ player, state }) => {
  state.players.some((pl) => pl.token === player.token) &&
    throwError('Token already in use');
};

/**
 * Validates a player has a sufficient balance
 * @param {Number} player.balance - Player's balance
 * @param {Number} needed.amount - Amount needed
 * @throws {MonopolyError}
 */
export const sufficientBalance = ({ player, needed }) => {
  player.balance < needed.amount &&
    throwError('Insufficient balance');
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
