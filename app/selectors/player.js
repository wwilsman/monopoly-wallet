import { createSelector } from 'reselect'

export const createGetPlayer = () => createSelector(
  [(state) => state.game.players, (s, pid) => pid],
  (players, pid) => players.find((p) => p._id === pid)
)

export const getCurrentPlayer = createSelector(
  [(state) => state, (state) => state.player],
  createGetPlayer()
)

export const createGetProperties = () => createSelector(
  [(state) => state.game.properties, (s, pid) => pid],
  (properties, pid) => properties.filter((p) => p.owner === pid)
)
