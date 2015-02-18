var MonopolyAssert = require('./monopoly-assert');
var PlayerClass    = require('./monopoly-player');
var PropertyClass  = require('./monopoly-property');
var _              = require('./helpers');

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


module.exports = Game;
