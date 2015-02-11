Config = (function () {

  // The Config Class
  // ==================

  // ```
  // Config({
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
  // });
  // ```

  function Config(opts) {

    // Singleton
    if (Config.instance) {
      return Config.instance;
    }

    // Extract *rates* so it doesnt clobber defaults
    var rates = opts.rates;
    delete opts.rates;

    // Fix players and properties
    Config.players = Config.loadPlayers(opts.players);
    Config.properties = Config.loadProperties(opts.properties);
    delete opts.properties;
    delete opts.players;

    // Extend options with defaults
    _.extend(Config, opts);

    // Extend *rates* with defaults
    _.extend(Config.rates, rates);
  }


  // Config Defaults
  // ----------------

  // Properties associated with this game
  Config.properties = {};

  // Players associated with this game
  Config.players = {};

  // Player starting balance
  Config.startBalance = 1500;

  // Total houses left for sale
  Config.availableHouses = 32;

  // Total hotels left for sale
  Config.availableHotels = 12;

  // Rates for various computations
  Config.rates = {
    mortgage: 0.5,
    unmortgage: 1.1,
    building: 0.5
  };


  // Config Methods
  // ----------------

  // Turn JSON object into Property instances
  Config.loadProperties = function(properties) {
    properties.forEach(function(property) {
      new Property(property);
    });
  };

  // Turn JSON object into Player instances
  Config.loadPlayers = function(players) {
    players.forEach(function(player) {
      new Player(player);
    });
  };


  return Config;

})();
