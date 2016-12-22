import { createSelector } from 'reselect'

const getPlayers = (state) => state.game.players

export const getUsedTokens = createSelector(
  getPlayers,
  (players) => players.map((p) => p.token)
)

export const getOrderedPlayers = createSelector(
  [getPlayers, (s) => s.player],
  (players, pid) => {
    let i = players.findIndex((p) => p._id === pid)

    return [
      players[i],
      ...players.slice(0, i),
      ...players.slice(i + 1)
    ]
  }
)
