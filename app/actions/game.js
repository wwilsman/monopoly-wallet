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

export function joinGame(gameID, playerData) {
  return { type: 'SOCKET_EMIT', event: 'game:join', args: [gameID, playerData] }
}

export function voteInPoll(pollID, vote) {
  return { type: 'SOCKET_EMIT', event: 'poll:vote', args: [pollID, vote] }
}

export function payBank(amount) {
  return { type: 'SOCKET_EMIT', event: 'game:pay-bank', args: [amount] }
}

export function collectMoney(amount) {
  return { type: 'SOCKET_EMIT', event: 'game:collect-money', args: [amount] }
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
