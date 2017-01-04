import { createSelector } from 'reselect'

export const getUsedTokens = createSelector(
  (state) => state.game.players,
  (players) => players.map((p) => p.token)
)

export const getUnownedProperties = createSelector(
  (state) => state.game.properties,
  (properties) => properties.filter((p) => p.owner === 'bank')
)
