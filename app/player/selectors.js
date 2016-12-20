import { createSelector } from 'reselect'

const getPlayerID = (state) => state.player

export const getCurrentPlayer = createSelector(
  [(state) => state.game.players, getPlayerID],
  (players, pid) => players.find((p) => p._id === pid)
)

export const getPlayerProperties = createSelector(
  [(state) => state.game.properties, getPlayerID],
  (properties, pid) => properties.filter((p) => p.owner === pid)
)
