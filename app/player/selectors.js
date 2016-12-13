import { createSelector } from 'reselect'

const getPlayerID = (state) => state.player
const getPlayers = (state) => state.game.players

export const getCurrentPlayer = createSelector(
  [getPlayers, getPlayerID],
  (players, pid) => players.find((p) => p._id === pid)
)
