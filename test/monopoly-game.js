var _            = require('../lib/helpers');
var MonopolyGame = require('../lib/monopoly-game');
var assert       = require('assert');

describe('Game', function() {
  let config, game;

  config = _.loadJSONFile('./app/themes/classic/config.json');
  config.properties = _.loadJSONFile('./app/themes/classic/properties.json');
  config.assets = _.loadJSONFile('./app/themes/classic/assets.json');
  config.players = [{ name: 'Player 1' }];
  config.bank = config.start * 2;

  beforeEach(function() {
    game = new MonopolyGame(_.randID(), config);
  });

  it('should create a new game', function() {
    assert.ok(game && game instanceof MonopolyGame);
  });

  it('should create player', function() {
    assert.ok(game.players[0] instanceof MonopolyGame.Player);
  });

  it('should create property', function() {
    assert.ok(game.properties[0] instanceof MonopolyGame.Property);
  });

  it('should create asset', function() {
    assert.ok(game.assets[0] instanceof MonopolyGame.Asset);
  });

  it('should start new players with starting balance', function() {
    assert.equal(game.players[0].balance, game.start);
  });

  it('should start players with existing balance', function() {
    game = new MonopolyGame(_.randID(), _.extend({}, config, {
      players: [{ name: 'Player 1', balance: 1 }]
    }));

    assert.equal(game.players[0].balance, 1);
  });

  it('should allow custom building limits', function() {
    game = new MonopolyGame(_.randID(), _.extend({}, config, {
      houses: 1,
      hotels: 1
    }));

    assert.equal(1, game.houses);
    assert.equal(1, game.hotels);
  });

  it('should have custom rates', function() {
    game = new MonopolyGame(_.randID(), _.extend({}, config, {
      mortgageRate: 0,
      interestRate: 0,
      buildingRate: 0
    }));

    assert.equal(game.properties[0].mortgage, 0);
    assert.equal(game.properties[0].interest, 0);
    assert.equal(game.properties[0].improvementValue, 0);
  });

  describe('#join', function() {
    it('should create a new player', function() {
      let player = game.join({ name: 'Player 2' });

      assert.ok(player instanceof MonopolyGame.Player);
    });

    it('should give new player start balance', function() {
      let player = game.join({ name: 'Player 2', balance: 1 });

      assert.notEqual(player.balance, 1);
      assert.equal(player.balance, game.start);
    });
  });
});
