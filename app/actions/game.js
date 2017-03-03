export function updateGame(game) {
  return { type: 'UPDATE_GAME', game }
}

export function connectGame(room) {
  return { type: 'CONNECT_GAME', event: 'room:connect', payload: { room } }
}

export function disconnectGame() {
  return { type: 'DISCONNECT_GAME' }
}

export function joinGame(name, token) {
  return { type: 'JOIN_GAME', event: 'game:join', payload: { name, token } }
}

export function voteInPoll(poll, vote) {
  return { type: 'POLL_VOTE', event: 'poll:vote', payload: { poll, vote } }
}

export function payBank(amount) {
  return { type: 'PAY_BANK', event: 'game:pay-bank', payload: { amount } }
}

export function collectMoney(amount) {
  return { type: 'COLLECT_MONEY', event: 'game:collect-money', payload: { amount } }
}

export function payRent(property) {
  return { type: 'PAY_RENT', event: 'game:pay-rent', payload: { property } }
}

export function claimBankruptcy(beneficiary = 'bank') {
  return { type: 'CLAIM_BANKRUPTCY', event: 'game:claim-bankruptcy', payload: { beneficiary } }
}

export function buyProperty(property) {
  return { type: 'BUY_PROPERTY', event: 'game:buy-property', payload: { property } }
}

export function improveProperty(property) {
  return { type: 'IMPROVE_PROPERTY', event: 'game:improve-property', payload: { property } }
}

export function unimproveProperty(property) {
  return { type: 'UNIMPROVE_PROPERTY', event: 'game:unimprove-property', payload: { property } }
}

export function mortgageProperty(property) {
  return { type: 'MORTGAGE_PROPERTY', event: 'game:mortgage-property', payload: { property } }
}

export function unmortgageProperty(property) {
  return { type: 'UNMORTGAGE_PROPERTY', event: 'game:unmortgage-property', payload: { property } }
}

export function auctionProperty(property) {
  return { type: 'AUCTION_PROPERTY', event: 'auction:start', payload: { property } }
}

export function placeAuctionBid(property, amount) {
  return { type: 'PLACE_AUCTION_BID', event: 'auction:bid', payload: { property, amount } }
}

export function concedeAuction(property) {
  return { type: 'CONCEDE_AUCTION', event: 'auction:concede', payload: { property } }
}

export function offerTrade(player, offer, trade) {
  return { type: 'OFFER_TRADE', event: 'trade:offer', payload: { player, trade: [offer, trade] } }
}

export function declineTrade(player) {
  return { type: 'DECLINE_TRADE', event: 'trade:decline', payload: { player } }
}

export function acceptTrade(player) {
  return { type: 'ACCEPT_TRADE', event: 'trade:accept', payload: { player } }
}

export function sendMessage(player, message) {
  return { type: 'SEND_MESSAGE', event: 'message:send', payload: { player, message } }
}
