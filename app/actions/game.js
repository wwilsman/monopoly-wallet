import fetch from 'isomorphic-fetch'

export function updateTheme(theme, tokens, icons) {
  return { type: 'UPDATE_THEME', theme, tokens, icons }
}

export function updatePlayers(players = []) {
  return { type: 'UPDATE_PLAYERS', players }
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
            dispatch(updateTheme(info.theme, info.tokens, info.icons)),
            dispatch(updatePlayers(info.players))
          ])
        }
      })
  }
}
