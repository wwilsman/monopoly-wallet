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
  amount: calc(({ config }) => config.playerStart)
});

/**
 * Action creator for transfers
 * Omitting `otherId` will make a transfer to/from the bank
 * @param {String} playerToken - Player token
 * @param {String} [otherToken] - Other player's token
 * @param {Number} amount - Amount to transfer (+/- for bank transfers)
 * @returns {Object} Redux action
 */
export const makeTransfer = (playerToken, otherToken, amount = otherToken) => {
  let actionType = MAKE_TRANSFER_WITH;

  if (otherToken === amount) {
    actionType = amount > 0 ?
      MAKE_TRANSFER_TO :
      MAKE_TRANSFER_FROM;
    amount = Math.abs(amount);
    otherToken = null;
  }

  return {
    type: actionType,
    player: { token: playerToken },
    other: { token: otherToken },
    amount
  };
};

/**
 * Action creator for claiming bankruptcy
 * @param {String} playerToken - Player token
 * @param {String} [beneficiaryToken="bank"] - Beneficiary token
 * @returns {Object} Redux action
 */
export const bankrupt = (playerToken, beneficiaryToken = 'bank') => ({
  type: CLAIM_BANKRUPTCY,
  player: { token: playerToken },
  other: { token: beneficiaryToken },
  amount: calc(({ player }) => player.balance),
  properties: calc(({ state, player }) => (
    state.properties
      .filter((pr) => pr.owner === player.token)
      .map((pr) => pr.id)
  ))
});
