var _                 = require('./helpers');
var MonopolyProperty  = require('./monopoly-property');
var MonopolyPlayer    = require('./monopoly-player');
var MonopolyAsset     = require('./monopoly-asset');

// The Game Class
// ==================

class MonopolyGame {

  constructor(gameID, {
    theme = '',
    bank = 0,
    start = 0,
    houses = 0,
    hotels = 0,
    mortgageRate = 0,
    interestRate = 0,
    buildingRate = 0,
    properties = [],
    players = [],
    assets = [],
  }) {

    // Set the ID
    this._id = gameID;

    // Create the default "bank" player
    this.bank = new MonopolyPlayer(this, {
      name: 'bank',
      token: 'bank',
      balance: bank
    });

    // Load players
    this.players = players.map((pl) => {
      if (typeof pl.balance === 'undefined') {
        this.bank.balance -= start;
        pl.balance = start
      }

      return new MonopolyPlayer(this, pl);
    });

    // Load properties
    this.properties = properties.map((p) => {
      p = new MonopolyProperty(this, p);
      p.owner = !p.owner || p.owner === 'bank' ? this.bank :
        this.players.find((pl) => pl._id === p.owner);
      return p;
    });

    // Load assets
    this.assets = [];
    assets.forEach((a) => {
      a = new MonopolyAsset(this, a);
      a.owner = !a.owner || a.owner === 'bank' ? this.bank :
        this.players.find((pl) => pl._id === a.owner);
      this.assets.push(a);
    });

    // Set remaining attributes
    _.extend(this, { theme, start, houses, hotels, mortgageRate, interestRate, buildingRate });
  }

  join({ name = '', token = '' }) {
    let player = new MonopolyPlayer(this, { name, token, balance: this.start });
    this.bank.balance -= this.start;
    this.players.push(player);
    return player;
  }

  toJSON() {
    let { _id, theme, start, houses, hotels, mortgageRate, interestRate, buildingRate } = this;
    let properties = this.properties.map((p) => p.toJSON());
    let players = this.players.map((pl) => pl.toJSON());
    let assets = this.assets.map((a) => a.toJSON());
    let bank = this.bank.balance;

    return {
      _id,
      theme,
      bank,
      start,
      houses,
      hotels,
      mortgageRate,
      interestRate,
      buildingRate,
      properties,
      players,
      assets
    };
  }
}

MonopolyGame.Player = MonopolyPlayer;
MonopolyGame.Property = MonopolyProperty;
MonopolyGame.Asset = MonopolyAsset;

module.exports = MonopolyGame;
