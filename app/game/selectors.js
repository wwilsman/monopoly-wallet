import { createSelector } from 'reselect'

const getPlayers = (state) => state.game.players

export const getUsedTokens = createSelector(
  getPlayers,
  (players) => players.map((p) => p.token)
)

export const getOrderedPlayers = createSelector(
  [getPlayers, (s) => s.player],
  (players, pid) => players.slice(0).sort((a, b) => a._id === pid ? 0 : 1)
)
