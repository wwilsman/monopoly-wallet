var MonopolyGame = require('../lib/monopoly-game');
var assert       = require('assert');

describe('Game', function() {
  it('should create a new game', function() {
    assert.ok(new MonopolyGame);
  });

  it('should create player and property instances', function() {
    var M = new MonopolyGame({
      players: [{ name: '1' }],
      properties: [{
        name: '1',
        group: '1', 
        costs: {
          price: 1,
          build: 1,
          price: 100
        }
      }]
    });

    assert.ok(M.Player.get('1') instanceof M.Player);
    assert.ok(M.Property.get('1') instanceof M.Property);
  });

  it('should start players with custom balance', function() {
    var M = new MonopolyGame({
      players: [{ name: '1' }],
      startBalance: 1
    });

    assert.equal(1, M.Player.get('1').balance);
  });

  it('should have custom building limits', function() {
    var M = new MonopolyGame({
      availableHouses: 1,
      availableHotels: 1
    });

    assert.equal(1, M.availableHouses);
    assert.equal(1, M.availableHotels);
  });

  it('should have custom rates', function() {
    var M = new MonopolyGame({
      properties: [{
        name: '1',
        group: '1', 
        costs: {
          price: 1,
          build: 1
        }
      }],

      rates: {
        mortgage: 0,
        interest: 1,
        building: 0
      }
    });

    var prop = M.Property.get('1');

    assert.equal(0, prop.values.mortgage);
    assert.equal(prop.values.mortgage, prop.costs.interest);
    assert.equal(0, prop.values.building);
  });
});
