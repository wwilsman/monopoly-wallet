// Helper functions
// ----------------

module.exports = {

  extend: function (obj) {
    var i, length, source, prop;

    for (i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];

      for (prop in source) {
        if (source.hasOwnProperty(prop)) {
            obj[prop] = source[prop];
        }
      }
    }

    return obj;
  },

  keys: function(obj) {
    return Object.keys(obj);
  },

  // Create a Unique ID not already in the database
  generateUID: function(db, callback, length) {
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var uid = '';

    length = length || 5;

    for (var i = 0; i < length; i++) {
      uid += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    db.findOne({ _id: uid }, function(err, doc) {

      // Error
      if (err) {
        return callback(err);
      }

      // ID not in use
      if (!doc) {
        return callback(null, uid);
      }

      // Try again
      generateUID(db, callback, length);
    });
  },

  // Lowercase and dasherize a string
  dasherize: function(str) {
    return str.toLowerCase().replace(' ', '-');
  },

  // Check the **body** object for required and validated fields
  validate: function(body, required, validations) {

    // Assume required is an object if not an array
    if (!(required instanceof Array)) {
      validations = required;
      required = [];
    }

    // Default params
    body = body || {};
    validations = validations || {};

    // Check for required fields
    for (var i = 0, l = required.length; i < l; i++) {
      if (!body.hasOwnProperty(required[i])) {
        return new Error('"' + required[i] + '" is a required field');
      }
    }

    // Check against **validations**
    for (var param in body) {
      var value = body[param];

      if (validations.hasOwnProperty(param)) {
        var valid = validations[param];

        if (valid instanceof RegExp) {
          if (!value.test(valid)) {
            return new Error('"' + param + '" doesn\'t match expected');
          }
        } else if (typeof valid === "function") {
          if (!valid(value, param)) {
            return new Error('"' + param + '" doesn\'t match expected');
          }
        }
      }
    }

    return body;
  },

  // Convert all-number strings within an object to floats
  fixNumberStrings: function(obj) {

    // Loop through the object
    for (var key in obj) {

      // Already a number
      if (typeof obj[key] === 'number') {
        continue;

      // Found a string
      } else if (typeof obj[key] === 'string') {

        // String only contains numbers
        if (obj[key].test(/-?\d+/)) {
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
  loadJSONFile: function(filename) {
    var read = require('fs').readFileSync,
      json;

    try {
      json = JSON.parse(read(filename).toString());
    } catch (e) {
      json = false;
    }

    return json;
  }
};
