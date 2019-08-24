import { useMemo } from 'react';
import { useGame } from '../api';

const { keys } = Object;

export function uid(prefix = 'uid') {
  let n = uid.n = (uid.n || 0) + 1;
  return `${prefix}-${n}`;
}

export function useUID(prefix) {
  return useMemo(() => uid(prefix), [prefix]);
}

export function useDataAttrs(props) {
  return keys(props).reduce((data, key) => {
    if (key.indexOf('data-') === 0) data[key] = props[key];
    return data;
  }, {});
}

export function useConfig() {
  let { config } = useGame();
  return config ?? {};
}

export function usePlayer(token) {
  let { players } = useGame();
  return players?.[token] ?? {};
}

export function usePlayers({ exclude = [] } = {}) {
  let { active, players } = useGame();

  return useMemo(() => (
    players?.all.reduce((all, token) => (
      exclude.includes(token) ? all : all.concat({
        active: active.includes(token),
        ...players[token]
      })
    ), []) ?? []
  ), [active, players, ...exclude]);
}

export function useProperty(id) {
  let { properties } = useGame();
  return properties?.[id] ?? {};
}

export function useProperties(token) {
  let { properties } = useGame();

  return useMemo(() => (
    properties?.all.reduce((all, id) => (
      properties[id].owner === token
        ? all.concat(properties[id])
        : all
    ), []) ?? []
  ), [token, properties]);
}
