var MonopolyGame = require('./index');

function monopolyReducer(state, action) {
  let game = new MonopolyGame(state._id, state);

  switch (action.type) {
    case 'JOIN_GAME':
      game.join(action.player);
      break;

    case 'IMPROVE_PROPERTY':
      game.improveProperty(action.player, action.property);
      break;

    case 'UNIMPROVE_PROPERTY':
      game.unimproveProperty(action.player, action.property);
      break;

    case 'MORTGAGE_PROPERTY':
      game.mortgageProperty(action.player, action.property);
      break;

    case 'UNMORTGAGE_PROPERTY':
      game.unmortgageProperty(action.player, action.property);
      break;

    case 'MAKE_TRANSFER':
      game.makeTransfer(action.player1, action.player2, action.items);
      break;

    case 'CLAIM_BANKRUPTCY':
      game.claimBankruptcy(action.player, action.beneficiary);
      break;
  }

  return game.toJSON();
}

module.exports = monopolyReducer;
