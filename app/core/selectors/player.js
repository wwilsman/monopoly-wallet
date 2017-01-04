import { createSelector } from 'reselect'

export const getCurrentPlayer = createSelector(
  [(state) => state.game.players, (state) => state.player],
  (players, pid) => players.find((p) => p._id === pid)
)

export const makeGetPlayerProperties = () => createSelector(
  [(state) => state.game.properties, (state, pid) => pid],
  (properties, pid) => properties.filter((p) => p.owner === pid)
)
