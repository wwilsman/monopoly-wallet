var _ = require('../helpers');
var MonopolyProperty = require('./property');
var MonopolyPlayer = require('./player');
var MonopolyAsset = require('./asset');

// The Game Class
// ==================

class MonopolyGame {

  constructor({
    _id = '',
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
    _.extend(this, { _id, theme, start, houses, hotels, mortgageRate, interestRate, buildingRate });
  }

  join({ name = '', token = '' }) {
    let player = new MonopolyPlayer(this, { name, token, balance: this.start });
    this.bank.balance -= this.start;
    this.players.push(player);
    return player;
  }

  improveProperty(player, property) {
    player = this.getPlayer(player);
    property = this.getProperty(property);
    player.improve(property);
  }

  unimproveProperty(player, property) {
    player = this.getPlayer(player);
    property = this.getProperty(property);
    player.unimprove(property);
  }

  mortgageProperty(player, property) {
    player = this.getPlayer(player);
    property = this.getProperty(property);
    player.mortgage(property);
  }

  unmortgageProperty(player, property) {
    player = this.getPlayer(player);
    property = this.getProperty(property);
    player.unmortgage(property);
  }

  makeTransfer(player1, player2, { money = 0, properties = [], assets = [] }) {
    player1 = game.findPlayer(player1);
    player2 = game.findPlayer(player2);
    properties = properties.map(game.findProperty, game);
    assets = assets.map(game.findAsset, game);
    player1.transfer(player2, [money, ...properties, ...assets]);
  }

  claimBankruptcy(player, beneficiary) {
    player = game.findPlayer(player);
    beneficiary = game.findPlayer(beneficiary);
    beneficiary.bankrupt(player);
  }

  getPlayer(player) {
    if (typeof player === 'string') {
      return this.players.find((p) => p._id === player || p.name === player);
    } else if (player instanceof MonopolyPlayer) {
      return player;
    }
  }

  getProperty(property) {
    if (typeof property === 'string') {
      return this.properties.find((p) => p._id === property || p.name === property);
    } else if (property instanceof MonopolyProperty) {
      return property;
    }
  }

  getAsset(asset) {
    if (typeof asset === 'string') {
      return this.assets.find((p) => p._id === asset || p.name === asset);
    } else if (asset instanceof MonopolyAsset) {
      return asset;
    }
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