import { isPojo } from './helpers';

const { assign, keys } = Object;
const { isArray } = Array;

// deeply constructs a "diff" between two objects; only tracking values from `a`
function diff(a, b) {
  let allKeys = keys(a).concat(keys(b))
    .filter((v, i, k) => k.indexOf(v) === i);

  return allKeys.reduce((d, k) => {
    // no diff
    if (a[k] === b[k]) {
      return d;
    // deep diff
    } else if ((isPojo(a[k]) && isPojo(b[k])) || (isArray(a[k]) && isArray(b[k]))) {
      return assign(d, { [k]: diff(a[k], b[k]) });
    // track diff
    } else {
      return assign(d, { [k]: a[k] });
    }
  }, isArray(a) ? [] : {});
}

// deeply merges two objects, returning a new object
function merge(a, b) {
  return keys(b).reduce((c, k) => {
    // no merge
    if (a[k] === b[k]) {
      return c;
    // deep merge
    } else if ((isPojo(a[k]) && isPojo(b[k])) || (isArray(a[k]) && isArray(b[k]))) {
      return assign(c, { [k]: merge(a[k], b[k]) });
    // override merge
    } else {
      return assign(c, { [k]: b[k] });
    }
  }, isArray(a) ? [...a] : { ...a });
}

// adds a new diff to the history of the next state
export function recordHistory(prev, next) {
  let state = { ...next, timestamp: Date.now() };
  state.history = [diff(prev, state), ...(state.history || [])];
  return state;
}

// recursively merges previous state diffs up until the timestamp
export function getStateBefore(state, timestamp) {
  let entry, message;

  for (entry of (state.history || [])) {
    if (entry.timestamp <= timestamp) {
      // record the message from the last overwritten state
      message = state.notice?.message;
      state = merge(state, entry);
    } else {
      break;
    }
  }

  return [state, message];
}
