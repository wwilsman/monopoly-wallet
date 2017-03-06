import { createSelector } from 'reselect'

export const createGetProperty = () => createSelector(
  [(state) => state.game.properties, (s, property) => property],
  (properties, name) => properties.find((p) => p.name === name)
)

const createGetPropertyGroup = () => createSelector(
  [(state) => state.game.properties, (s, property) => property.group],
  (properties, group) => properties.filter((p) => p.group === group)
)

export const createIsPropertyMonopoly = () => createSelector(
  createGetPropertyGroup(),
  (group) => group.every((p) => !p.isMortgaged && p.owner === group[0].owner)
)
