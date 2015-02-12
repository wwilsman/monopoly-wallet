Monopoly.configure = (function () {

  // Configuration
  // ==================

  // ```
  // config = {
  //   properties: properties.json,
  //   players: players.json,
  //   startBalance: 1500,
  //   houseLimit: 32,
  //   hotelLimit: 12,
  //   rates: {
  //     mortgage: 0.5,
  //     unmortgage: 1.1,
  //     building: 0.5
  //   }
  // };
  // ```

  // Config Defaults
  // ----------------

  // Properties associated with this game
  Monopoly.properties = {},

  // Players associated with this game
  Monopoly.players = {},

  // Configuration object
  Monopoly.config = {

    // Player starting balance
    startBalance: 1500,

    // Total houses left for sale
    availableHouses: 32,

    // Total hotels left for sale
    availableHotels: 12,

    // Rates for various computations
    rates: {
      mortgage: 0.5,
      unmortgage: 1.1,
      building: 0.5
    },


    // Methods
    // ----------------

    // Turn JSON object into Property instances
    loadProperties: function(properties) {
      properties.forEach(function(property) {
        new Property(property);
      });
    },

    // Turn JSON object into Player instances
    loadPlayers: function(players) {
      players.forEach(function(player) {
        new Player(player);
      });
    }
  };


  // Configuration Function
  // ----------------------

  return function(opts) {

    // Set players and properties
    config.players = config.loadPlayers(opts.players);
    config.properties = config.loadProperties(opts.properties);

    // Set building limits
    config.availableHouses = opts.houseLimit;
    config.availableHotels = opts.hotelLimit;

    // Set player starting balance
    config.startBalance = opts.startBalance;

    // Extend *rates* with defaults
    _.extend(config.rates, opts.rates);
  };

})();
