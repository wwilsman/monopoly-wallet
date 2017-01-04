import fetch from 'isomorphic-fetch'

export function updateGame(state) {
  return { type: 'UPDATE_GAME', state }
}
