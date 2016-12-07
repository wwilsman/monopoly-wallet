export function joinGame({ _id, name, token, balance }) {
  return { type: 'JOIN_GAME', player: { _id, name, token, balance } }
}

export function activatePlayer(player, isActive = true) {
  return { type: 'ACTIVATE_PLAYER', player, isActive }
}

export function bankTransfer(player, amount) {
  return { type: 'BANK_TRANSFER', player, amount }
}

export function transferMoney(fromPlayer, toPlayer, amount) {
  return { type: 'TRANSFER_MONEY', fromPlayer, toPlayer, amount }
}

export function transferProperty(toPlayer, property) {
  return { type: 'TRANSFER_PROPERTY', toPlayer, property }
}

export function buildProperty(property, houses, hotels) {
  return { type: 'BUILD_PROPERTY', property, houses, hotels }
}

export function mortgageProperty(property, unmortgage) {
  return { type: 'MORTGAGE_PROPERTY', property, unmortgage }
}

export function bankruptPlayer(player) {
  return { type: 'BANKRUPT_PLAYER', player }
}

export function saveState(message, blame = []) {
  return { type: 'SAVE_STATE', message, blame }
}

export function addHistory() {
  return { type: 'ADD_HISTORY' }
}
