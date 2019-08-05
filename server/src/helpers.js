const { assign, entries } = Object;

// computes common meta information from the state
export function meta(state, data) {
  let expand = (key, value) => {
    switch (key) {
      case 'player': case 'owner': case 'other':
        return state.players[value] || { token: value };
      case 'property':
        return state.properties[value] || { id: value };
      case 'amount':
        return Math.abs(value);
      default:
        return value;
    }
  };

  return entries(data).reduce((m, [key, value]) => {
    return assign(m, { [key]: expand(key, value) });
  }, Object.create(null));
}

// returns the value of a path within an object, or undefined if any ancestor of
// the path is falsey
export function get(path, object) {
  return path.split('.').reduce((parent, key) => {
    return parent ? parent[key] : undefined;
  }, object);
}

// returns a random string defaulting to a length of 5 characters
export function randomString(length = 5) {
  let possible = 'ABCDEFHIGKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    let rand = Math.floor(Math.random() * possible.length);
    result += possible.charAt(rand);
  }

  return result;
}
