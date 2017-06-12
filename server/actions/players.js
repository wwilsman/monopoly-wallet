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
 * @param {String} playerId - Player ID
 * @param {String} [otherId] - Other player's ID
 * @param {Number} amount - Amount to transfer (+/- for bank transfers)
 * @returns {Object} Redux action
 */
export const makeTransfer = (playerId, otherId, amount = otherId) => {
  let actionType = MAKE_TRANSFER_WITH;

  if (otherId === amount) {
    actionType = amount > 0 ?
      MAKE_TRANSFER_TO :
      MAKE_TRANSFER_FROM;
    amount = Math.abs(amount);
    otherId = null;
  }

  return {
    type: actionType,
    player: { id: playerId },
    other: { id: otherId },
    amount
  };
};

/**
 * Action creator for claiming bankruptcy
 * @param {String} playerId - Player ID
 * @param {String} [beneficiaryId="bank"] - Beneficiary ID
 * @returns {Object} Redux action
 */
export const bankrupt = (playerId, beneficiaryId = 'bank') => ({
  type: CLAIM_BANKRUPTCY,
  player: { id: playerId },
  other: { id: beneficiaryId },
  amount: calc(({ player }) => player.balance),
  properties: calc(({ state, player }) => (
    state.properties
      .filter((pr) => pr.owner === player.id)
      .map((pr) => pr.id)
  ))
});
