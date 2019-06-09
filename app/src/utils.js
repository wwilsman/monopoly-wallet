import { useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

export function uid(prefix = 'uid') {
  let n = uid.n = (uid.n || 0) + 1;
  return `${prefix}-${n}`;
}

export function useUID(prefix) {
  return useMemo(() => uid(prefix), [prefix]);
}

export function useApp() {
  return useSelector(({ app }) => app);
}

export function useConfig() {
  return useSelector(({ config }) => config);
}

const selectPlayers = createSelector(
  ({ game }) => game ? game.players : { _all: [] },
  ({ app }) => app.players,
  (players, active) => players._all.map(token => ({
    active: active.includes(token),
    ...players[token]
  }))
);

export function usePlayers() {
  return useSelector(selectPlayers);
}

const selectPlayer = createSelector(
  ({ game }) => game ? game.players : {},
  ({ app }) => app.player && app.player.token,
  (players, token) => token && players[token]
);

export function usePlayer() {
  return useSelector(selectPlayer);
}

export function useWaitingFor(event) {
  let { waiting } = useApp();

  return useMemo(
    () => waiting.includes(event),
    [waiting, event]
  );
}

export function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

export function dataAttrs(props) {
  return Object.keys(props).reduce((data, key) => {
    if (key.match(/^data-/)) {
      data[key] = props[key];
    }

    return data;
  }, {});
}
