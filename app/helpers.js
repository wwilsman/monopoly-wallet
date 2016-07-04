var MonopolyError = require('./game/error');

// Helper functions
// ----------------

module.exports = {

  assert(errorName, message, condition) {
    if (condition) {
      throw new MonopolyError(errorName, message);
    }
  },

  extend(obj, ...others) {

    others.filter((o) => !!o).forEach((source) => {
      for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
          if (obj[prop] !== undefined && typeof source[prop] === 'object' && source[prop] !== null) {
            if (Array.isArray(source[prop])) {
              obj[prop] = source[prop].slice(0);
            } else {
              obj[prop] = extend({}, obj[prop], source[prop]);
            }
          } else {
            obj[prop] = source[prop];
          }
        }
      }
    });

    return obj;
  },

  // Create a random ID
  randID(length = 5) {
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let rand = '';

    for (let i = 0; i < length; i++) {
      rand += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return rand;
  },

  // Lowercase and dasherize a string
  dasherize(str) {
    return str.toLowerCase().replace(' ', '-');
  },

  // Convert all-number strings within an object to floats
  fixNumberStrings(obj) {

    // Loop through the object
    for (var key in obj) {

      // Already a number
      if (typeof obj[key] === 'number') {
        continue;

      // Found a string
      } else if (typeof obj[key] === 'string') {

        // String only contains numbers
        if (obj[key].test(/-?\d+(\.\d+)?/)) {
          obj[key] = parseFloat(obj[key], 10);
        }

      // Assume it's an object or array
      } else {
        obj[key] = fixNumberStrings(obj[key]);
      }
    }

    return obj;
  },

  // Return data from a JSON file (not requiring directly to avoid caching)
  loadJSONFile(filename) {
    try {
      let read = require('fs').readFileSync;
      return JSON.parse(read(filename).toString());
    } catch (e) {}
  }
};
