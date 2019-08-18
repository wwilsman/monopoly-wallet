export default {
  save(state) {
    Object.keys(state).forEach(key => {
      let value = JSON.stringify(state[key]);
      window.localStorage.setItem(key, value);
    });
  },

  load(key, defaultValue = {}) {
    let value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  }
};
