import fetch from 'isomorphic-fetch'
import { setError } from './error'
import { triggerError } from './toasts'
import { updateTheme, clearTheme } from './theme'

export function updateGame(payload) {
  return { type: 'UPDATE_GAME', payload }
}

export function clearGame() {
  return { type: 'CLEAR_GAME' }
}

export function joinGame(...args) {
  return { type: 'SOCKET_EMIT', event: 'game:join', args }
}

export function voteInPoll(...args) {
  return { type: 'SOCKET_EMIT', event: 'poll:vote', args }
}

export function payBank(...args) {
  return { type: 'SOCKET_EMIT', event: 'game:pay-bank', args }
}

export function collectMoney(...args) {
  return { type: 'SOCKET_EMIT', event: 'game:collect-money', args }
}

export function improveProperty(...args) {
  return { type: 'SOCKET_EMIT', event: 'game:improve-property', args }
}

export function unimproveProperty(...args) {
  return { type: 'SOCKET_EMIT', event: 'game:unimprove-property', args }
}

export function mortgageProperty(...args) {
  return { type: 'SOCKET_EMIT', event: 'game:mortgage-property', args }
}

export function unmortgageProperty(...args) {
  return { type: 'SOCKET_EMIT', event: 'game:unmortgage-property', args }
}

export function offerTrade(...args) {
  return { type: '@TODO', event: 'trade:offer', args }
}

export function payRent(...args) {
  return { type: 'SOCKET_EMIT', event: 'game:pay-rent', args }
}

export function auctionProperty(...args) {
  return { type: '@TODO', event: 'auction:start', args }
}

export function buyProperty(...args) {
  return { type: 'SOCKET_EMIT', event: 'game:buy-property', args }
}

export function fetchGameInfo(gameID, hardError = true) {
  return (dispatch) => fetch(`/api/info?game=${gameID}`)
    .then((response) => response.json())
    .then(({ error, message, game, theme }) => {
      if (error) {
        if (hardError) {
          dispatch(setError(error, message))
        } else {
          dispatch(triggerError(message))
        }
      } else {
        return Promise.all([
          dispatch(updateGame(game)),
          dispatch(updateTheme(theme))
        ])
      }
    })
}

export function clearGameInfo() {
  return (dispatch) => Promise.all([
    dispatch(clearGame()),
    dispatch(clearTheme())
  ])
}
