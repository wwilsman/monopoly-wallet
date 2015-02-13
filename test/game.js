var assert = require('assert');
var _ = require('../lib/helpers');
var MonopolyGame = require('../lib/main');

var exconfig = JSON.parse(require('fs').readFileSync('./example.json'));

describe('Game', function() {
  var config

  beforeEach(function() {
    config = _.extend({}, exconfig);
  });

  it('should create a new game and cache it', function() {
    var M = new MonopolyGame;

    assert.ok(M);
    assert.equal(M, MonopolyGame.get(M.id));
  });

  it('should create player and property instances', function() {
    var M = new MonopolyGame(config);

    assert.ok(M.Player.get('player 1') instanceof M.Player);
    assert.ok(M.Property.get('Oriental Avenue') instanceof M.Property);
  });

  it('should start players with custom balance', function() {
    config.startBalance = 1;

    var M = new MonopolyGame(config);

    assert.equal(1, M.Player.get('player 1').balance);
  });

  it('should start bank with custom balance', function() {
    config.bankBalance = 1;

    var M = new MonopolyGame(config);

    assert.equal(1, M.Bank.balance);
  });

  it('should have custom building limits', function() {
    config.availableHouses = 1;
    config.availableHotels = 1;

    var M = new MonopolyGame(config);

    assert.equal(1, M.availableHouses);
    assert.equal(1, M.availableHotels);
  });

  it('should have custom rates', function() {
    config.rates = { mortgage: 0, unmortgage: 1, building: 0 };
    config.properties[0].costs.price = 100;

    var M = new MonopolyGame(config);
    var prop = M.Property.get(config.properties[0].name);

    assert.equal(0, prop.values.mortgage);
    assert.equal(prop.costs.price, prop.costs.mortgage);
    assert.equal(0, prop.values.building);
  });
});
