import fetch from 'isomorphic-fetch'

export function updateGame(state) {
  return { type: 'UPDATE_GAME', state }
}

export function setCurrentPlayer(playerID) {
  return { type: 'SET_CURRENT_PLAYER', playerID }
}

export function updateTheme(theme) {
  return { type: 'UPDATE_THEME', theme }
}

export function fetchGameInfo(gameID) {
  return (dispatch) => {
    fetch(`/api/info?game=${gameID}`)
      .then((response) => response.json())
      .then(({ error, ...info }) => {
        if (error) {
          console.log(error, info.message) // TODO: handle me!
        } else {
          return Promise.all([
            dispatch(updateGame(info.game)),
            dispatch(updateTheme(info.theme))
          ])
        }
      })
  }
}
