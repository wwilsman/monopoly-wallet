function joinGame({ name = '', token = '' }) {
  return { type: 'JOIN_GAME', player: { name, token } };
}

function improveProperty(player, property) {
  return { type: 'IMPROVE_PROPERTY', player, property };
}

function unimproveProperty(player, property) {
  return { type: 'UNIMPROVE_PROPERTY', player, property };
}

function mortgageProperty(player, property) {
  return { type: 'MORTGAGE_PROPERTY', player, property };
}

function unmortgageProperty(player, property) {
  return { type: 'UNMORTGAGE_PROPERTY', player, property };
}

function makeTransfer(player1, player2, { money = 0, properties = [], assets = [] }) {
  return { type: 'MAKE_TRANSFER', player1, player2, items: { money, properties, assets } };
}

function claimBankruptcy(player, beneficiary) {
  return { type: 'CLAIM_BANKRUPTCY', player, beneficiary };
}

module.exports = {
  joinGame,
  improveProperty,
  unimproveProperty,
  mortgageProperty,
  unmortgageProperty,
  makeTransfer,
  claimBankruptcy
};
