var _ = require('./helpers');
var PlayerClass = require('./player');
var PropertyClass = require('./property');
var MonopolyAssert = require('./assert');

// The Game Class
// ==================

// ```
// config = {
//   properties: properties.json,
//   players: players.json,
//   startBalance: 1500,
//   bankBalance: 15140,
//   availableHouses: 32,
//   availableHotels: 12,
//   rates: {
//     mortgage: 0.5,
//     unmortgage: 1.1,
//     building: 0.5
//   }
// };
// ```

function Game(config) {

  // Extract **rates** so it doesn't clobber defaults
  if (config && config.rates) {
    this.rates = config.rates;
    delete config.rates;
  }

  // Set config with defatuls
  _.extend(this, {
    startBalance: 1500,
    availableHouses: 32,
    availableHotels: 12
  }, config);

  // Extend *rates* with defaults
  this.rates = _.extend({
    mortgage: 0.5,
    unmortgage: 1.1,
    building: 0.5
  }, this.rates);

  // Create classes so they have access to the config
  this.Player = PlayerClass(this);
  this.Property = PropertyClass(this);

  // Create players and properties
  this.players = load(this, 'players');
  this.properties = load(this, 'properties');

  // Create game id
  this._id = createid();
}


// Helper Functions
// ----------------

// Transform game JSON into instances
function load(M, objstr) {
  var Obj = objstr === 'players' ? M.Player : M.Property;

  if (M[objstr]) {
    M[objstr].forEach(function(data) {
      new Obj(data);
    });
  }

  return Obj.collection;
}

// Create a unique id
function createid() {
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    id = '';

  for (var i = 0; i < 5; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  if (Game.collection[id]) {
    return createid();
  }

  return id;
}


module.exports = Game;
