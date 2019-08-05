// pipe helper; accepts an array or list of functions and skips non truthy functions
export function pipe(...fns) {
  if (fns.length === 1 && Array.isArray(fns[0])) fns = fns[0];
  return arg => fns.reduce((a, f) => f ? f(a) : a, arg);
}

// reducer creator for reducing any path within a state
export function reduce(path, reducer) {
  // creates a middleware-like pattern that recurses the provided path inwards
  // towards the inner-most value and builds new state outwards
  return path.split('.').reduceRight((next, key) => state => {
    if (state && Object.getPrototypeOf(state) === Object.prototype) {
      // create a new object
      return { ...state, [key]: next(state[key]) };

    } else if (Array.isArray(state)) {
      // create a new array
      return [...state.slice(0, key), next(state[key]), ...state.slice(key + 1)];

    } else {
      // return the existing state
      return state;
    }
  }, reducer);
}

// reducer creator to provide state values to other reducer creators
export function withState(f) {
  return state => f(state)(state);
}

// reducer creator to provide config values to other reducer creators
export function withConfig(f) {
  return withState(({ config }) => f(config));
}

// reducer creator to provide player information to other reducer creators
export function withPlayer(token, f) {
  return withState(({ players }) => f(players[token]));
}

// reducer creator to provide property information to other reducer creators
export function withProperty(id, f) {
  return withState(({ properties }) => f(properties[id]));
}

// reducer creator to provide own properties to other reducer creators
export function withOwnProperties(token, f) {
  return withState(({ properties }) => f(
    properties.all.reduce((own, id) => (
      properties[id].owner === token
        ? own.concat(properties[id])
        : own
    ), [])
  ));
}

// reducer creator to provide a group of properties to other reducer creators
export function withGroup(group, f) {
  return withState(({ properties }) => f(
    properties.all.reduce((g, id) => (
      properties[id].group === group
        ? g.concat(properties[id])
        : g
    ), [])
  ));
}
