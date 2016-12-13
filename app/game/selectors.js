import { createSelector } from 'reselect'

const getPlayers = (state) => state.game.players

export const getUsedTokens = createSelector(
  getPlayers,
  (players) => players.map((p) => p.token)
)
