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
  }
};