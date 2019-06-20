import { useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

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

export function useGame() {
  return useSelector(({ game }) => game);
}

export function usePlayer(token) {
  let { players } = useGame();
  return players[token];
}

export function useProperties(token) {
  let { properties } = useGame();

  return useMemo(() => (
    properties._all.reduce((all, id) => (
      properties[id].owner === token
        ? all.concat(properties[id])
        : all
    ), [])
  ), [token, properties]);
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
  return Object.keys(props).reduce((data, key) => (
    key.match(/^data-/) ? { ...data, [key]: props[key] } : data
  ), {});
}
