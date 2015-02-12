Monopoly.Game = (function () {

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
    this.Player = Monopoly.PlayerClass(this);
    this.Property = Monopoly.PropertyClass(this);

    // Create players and properties
    this.players = loadPlayers(this);
    this.properties = loadProperties(this);
  }

  // Turn JSON object into Property instances
  function loadProperties(game) {

    if (game.properties) {
      game.properties.forEach(function(property) {
        new game.Property(property);
      });
    }

    return game.Property.collection;
  }

  // Turn JSON object into Player instances
  function loadPlayers(game) {

    if (game.players) {
      game.players.forEach(function(player) {
        new game.Player(player);
      });
    }

    return game.Player.collection;
  }

  return Game;

})();
