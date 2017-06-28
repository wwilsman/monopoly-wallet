import { calc } from '../helpers';

export const JOIN_GAME = 'JOIN_GAME';
export const MAKE_TRANSFER_TO = 'MAKE_TRANSFER_TO';
export const MAKE_TRANSFER_FROM = 'MAKE_TRANSFER_FROM';
export const MAKE_TRANSFER_WITH = 'MAKE_TRANSFER_WITH';
export const CLAIM_BANKRUPTCY = 'CLAIM_BANKRUPTCY';

/**
 * Action creator for joining a game
 * @param {String} name - Player name
 * @param {String} token - Player token
 * @returns {Object} Redux action
 */
export const join = (name, token) => ({
  type: JOIN_GAME,
  player: { name, token },
  amount: calc(({ config }) => config.playerStart),
  notice: { id: 'player.joined' }
});

/**
 * Action creator for transfers
 * Omitting `otherId` will make a transfer to/from the bank
 * @param {String} playerToken - Player token
 * @param {String} [otherToken=bank] - Other player's token
 * @param {Number} amount - Amount to transfer (+/- for bank transfers)
 * @returns {Object} Redux action
 */
export const makeTransfer = (playerToken, otherToken, amount = otherToken) => {
  let actionType = MAKE_TRANSFER_WITH;
  let notice = { id: 'player.paid-other' };

  if (otherToken === amount) {
    actionType = amount > 0 ? MAKE_TRANSFER_TO : MAKE_TRANSFER_FROM;
    notice.id = amount > 0 ? 'player.paid-amount' : 'player.received-amount';
    amount = Math.abs(amount);
    otherToken = 'bank';
  }

  return {
    type: actionType,
    player: { token: playerToken },
    other: { token: otherToken },
    amount,
    notice
  };
};

/**
 * Action creator for claiming bankruptcy
 * @param {String} playerToken - Player token
 * @param {String} [beneficiaryToken="bank"] - Beneficiary token
 * @returns {Object} Redux action
 */
export const claimBankruptcy = (playerToken, beneficiaryToken = 'bank') => ({
  type: CLAIM_BANKRUPTCY,
  player: { token: playerToken },
  other: { token: beneficiaryToken },
  amount: calc(({ player }) => player.balance),
  properties: calc(({ state, player }) => (
    state.properties._all.filter((id) => (
      state.properties[id].owner === player.token
    ))
  )),
  notice: {
    id: beneficiaryToken === 'bank' ?
      'player.bankrupt' : 'player.other-bankrupt'
  }
});
