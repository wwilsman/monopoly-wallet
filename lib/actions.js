export function joinGame(name, token) {
  return { type: 'JOIN_GAME', player: { name, token } }
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

export function startAuction(property, players) {
  return { type: 'AUCTION_PROPERTY', property, players }
}

export function placeAuctionBid(player, amount) {
  return { type: 'PLACE_AUCTION_BID', player, amount }
}

export function concedeAuction(player) {
  return { type: 'CONCEDED_AUCTION', player }
}

export function endAuction() {
  return { type: 'END_AUCTION' }
}

export function buildProperty(property, houses, hotels) {
  return { type: 'BUILD_PROPERTY', property, houses, hotels }
}

export function mortgageProperty(property, unmortgage) {
  return { type: 'MORTGAGE_PROPERTY', property, unmortgage }
}

export function makeTrade(trade) {
  return { type: 'MAKE_TRADE', trade }
}

export function modifyTrade(index, trade) {
  return { type: 'MODIFY_TRADE', index, trade }
}

export function deleteTrade(index) {
  return { type: 'DELETE_TRADE', index }
}

export function bankruptPlayer(player) {
  return { type: 'BANKRUPT_PLAYER', player }
}

export function saveState(saveType, note, blame = [], meta) {
  return { type: 'SAVE_STATE', saveType, note, blame, meta }
}
