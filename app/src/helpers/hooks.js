import { useCallback, useMemo } from 'react';
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
  return useDataAttrProps(props)[0];
}

export function useDataAttrProps(props) {
  return keys(props).reduce(([data, rest], key) => {
    if (key.indexOf('data-') === 0) data[key] = props[key];
    else rest[key] = props[key];
    return [data, rest];
  }, [{}, {}]);
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
  return useFilteredProperties(p => p.owner === token, [token]);
}

export function useGroup(group, owner) {
  let all = useFilteredProperties(p => p.group === group, [group]);
  let owned = useMemo(() => all.filter(p => p.owner === owner), [all, owner]);
  let improvements = useMemo(() => all.reduce((m, p) => Math.max(m, p.buildings), 0), [all]);
  return { all, owned, improvements, length: all.length };
}

function useFilteredProperties(filterFn, deps) {
  let filter = useCallback(filterFn, deps);
  let { properties } = useGame();

  return useMemo(() => (
    properties?.all.reduce((all, id) => (
      filter(properties[id])
        ? all.concat(properties[id])
        : all
    ), []) ?? []
  ), [filter, properties]);
}
