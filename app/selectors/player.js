import { createSelector } from 'reselect';

const allPlayersSelector = (state) => state.game.state.players;
const activePlayersSelector = (state) => state.app.players;

export const getCurrentPlayers = createSelector(
  [allPlayersSelector, activePlayersSelector],
  (players, active) => {
    return players ? players._all.map((token) => ({
      active: active.includes(token),
      ...players[token]
    })) : [];
  }
);
