const storage = window.localStorage;

/**
 * Persists each value of a state by it's key
 * @param {Object} state - state to persist
 */
function save(state) {
  let keys = state ? Object.keys(state) : [];

  for (let i = 0, l = keys.length; i < l; i++) {
    let key = keys[i];
    let value = JSON.stringify(state[key]);
    storage.setItem(key, value);
  }
}

/**
 * Asyncronously recovers a saved state value by it's key
 * @param {String} key - the state key
 * @param {Mixed} [defaultValue={}] = returned when the state key
 * cannot be found
 * @returns {Mixed} the persisted value or defaultValue
 */
export function load(key, defaultValue = {}) {
  let value = storage.getItem(key);
  return value ? JSON.parse(value) : defaultValue;
}

/**
 * Middleware that persists filtered state
 * @param {Function} filter - function to return the actual state to save
 * @returns {Function} Redux middleware
 */
export const middleware = (filter) => (store) => {
  return (next) => (action) => {
    next(action);
    save(filter(store.getState()));
  };
};
