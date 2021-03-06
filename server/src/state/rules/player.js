import { error, withError } from '../../error';

// checks if the player's or bank's balance is more than or equal to an amount
export function isBalanceSufficient(token, amount) {
  return withError(({ bank, players }) => {
    if (token === 'bank') {
      if (bank < amount) throw error('common.bank-low');
    } else if (players[token].balance < amount) {
      throw error('player.balance', { player: token });
    }
  });
}

// checks if a player exists in the game
export function isPlayerFound(token) {
  return withError(({ players }) => {
    if (token !== 'bank' && !players[token]) {
      throw error('player.not-found', { player: token });
    }
  });
}

// checks if a token is valid or already in use
export function isTokenAllowed(token) {
  return withError(({ players, config }) => {
    if (config.playerTokens.indexOf(token) === -1) {
      throw error('player.missing-token', { player: token });
    } else if (players[token]) {
      throw error('player.used-token', { player: token });
    }
  });
}

// checks if a player is trying to perform an action with themselves
export function isNotSamePlayer(token, other) {
  return withError(() => {
    if (token === other) {
      throw error('player.self');
    }
  });
}

// checks if a player and optionally another is not bankrupt
export function isNotBankrupt(token, other) {
  return withError(({ players }) => {
    if (token !== 'bank' && players[token].bankrupt) {
      throw error('player.bankrupt');
    } else if (other && other !== 'bank' && players[other].bankrupt) {
      throw error('player.other-bankrupt', { other });
    }
  });
}
