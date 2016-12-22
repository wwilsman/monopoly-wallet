import { createSelector } from 'reselect'

export const getUnownedProperties = createSelector(
  (state) => state.game.properties,
  (properties) => properties.filter((p) => p.owner === 'bank')
)
