function Provider(){};

Provider.prototype = {
  data: [],

  findAll: function(callback) {
    callback(null, this.data);
  },

  findById: function(id, callback) {
    var result = null;

    for (var i = 0, l = this.data.length; i < l; i++) {
      if (this.data[i]._id === id) {
        result = this.data[i];
        break;
      }
    }

    callback(null, result);
  },

  save: function(data, callback) {
    if (typeof data.length === 'undefined') {
      data = [data];
    }

    for (var i = 0, l = data.length; i < l; i++) {
      this.data[this.data.length] = data[i];
    }

    callback(null, data);
  }
};

// Dummy data
new Provider().save(
  JSON.parse(require('fs').readFileSync('./example.json')),
function(error, data){});

module.exports = Provider;
