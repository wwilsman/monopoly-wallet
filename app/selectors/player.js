import { createSelector } from 'reselect';

const allPlayersSelector = (state) => state.game.state.players;
const activePlayersSelector = (state) => state.app.players;
const currentPlayerSelector = (state) => state.app.player;

export const getCurrentPlayer = createSelector(
  [allPlayersSelector, currentPlayerSelector],
  (players, current) => players && players[current]
);

export const getActivePlayers = createSelector(
  [allPlayersSelector, activePlayersSelector],
  (players, active) => {
    return players ? players._all.map((token) => ({
      active: active.includes(token),
      ...players[token]
    })) : [];
  }
);
