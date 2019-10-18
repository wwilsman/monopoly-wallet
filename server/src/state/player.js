import {
  pipe,
  reduce,
  withConfig,
  withOwnProperties,
  withPlayer
} from './utils';
import {
  transferAmount,
  transferProperty,
  notice
} from './common';
import {
  isBalanceSufficient,
  isNotNegative,
  isPlayerFound,
  isTokenAllowed,
  isNotSamePlayer,
  isNotBankrupt
} from './rules';

// adds a new player and subtracts the starting balance from the bank
export function join(name, token) {
  return pipe(
    isTokenAllowed(token),
    withConfig(({ playerStart }) => pipe(
      isBalanceSufficient('bank', playerStart),
      reduce('bank', b => b - playerStart),
      reduce('players.all', all => all.concat(token)),
      reduce(`players.${token}`, () => ({
        balance: playerStart,
        bankrupt: false,
        token,
        name,
      }))
    )),
    notice('player.joined', { player: token })
  );
}

// transfers an amount from a player to the bank or another player
export function transfer(from, to, amount) {
  let noticeId = to === 'bank'
    ? `player.${amount > 0 ? 'paid' : 'received'}-amount`
    : 'player.paid-other';

  return pipe(
    isPlayerFound(from),
    isNotSamePlayer(from, to),
    isPlayerFound(to),
    isNotBankrupt(from, to),
    isBalanceSufficient(from, amount),
    (to === 'bank'
      ? isBalanceSufficient(to, -amount)
      : isNotNegative(amount)),
    transferAmount(from, to, amount),
    notice(noticeId, { player: from, other: to, amount })
  );
}

// bankrupts a player and transfers balance and properties to the beneficiary
export function bankrupt(token, beneficiary) {
  let noticeId = `player.${beneficiary !== 'bank' ? 'other-' : ''}bankrupt`;

  return pipe(
    isPlayerFound(token),
    isNotSamePlayer(token, beneficiary),
    isPlayerFound(beneficiary),
    isNotBankrupt(token, beneficiary),
    withOwnProperties(token, properties => pipe(
      properties.map(({ id }) => (
        transferProperty(id, beneficiary)
      ))
    )),
    withPlayer(token, ({ balance }) => (
      transferAmount(token, beneficiary, balance)
    )),
    reduce(`players.${token}.bankrupt`, () => true),
    notice(noticeId, { player: token, other: beneficiary })
  );
}
