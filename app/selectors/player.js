import { createSelector } from 'reselect'

export const createGetPlayer = () => createSelector(
  [(state) => state.game.players, (s, token) => token],
  (players, token) => players.find((p) => p.token === token)
)

export const getCurrentPlayer = createSelector(
  [(state) => state, (state) => state.player],
  createGetPlayer()
)

export const createGetProperties = () => createSelector(
  [(state) => state.game.properties, (s, token) => token],
  (properties, token) => properties.filter((p) => p.owner === token)
)
