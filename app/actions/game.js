import fetch from 'isomorphic-fetch'
import { setError } from './error'
import { updateTheme, clearTheme } from './theme'

export function updateGame(payload) {
  return { type: 'UPDATE_GAME', payload }
}

export function clearGame() {
  return { type: 'CLEAR_GAME' }
}

export function fetchGameInfo(gameID, hardError = true) {
  return (dispatch) => fetch(`/api/info?game=${gameID}`)
    .then((response) => response.json())
    .then(({ error, message, game, theme }) => {
      if (error) {
        if (hardError) {
          dispatch(setError(error, message))
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
