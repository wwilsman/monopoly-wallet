var _             = require('../app/helpers');
var MonopolyGame  = require('../app/game');
var MonopolyError = require('../app/game/error');
var assert        = require('assert');

describe('Game', function() {
  let config, game;

  config = _.loadJSONFile('./app/themes/classic/config.json');
  config.properties = _.loadJSONFile('./app/themes/classic/properties.json');
  config.assets = _.loadJSONFile('./app/themes/classic/assets.json');
  config.players = [{ name: 'Player 1' }];
  config.bank = config.start * 2;

  beforeEach(function() {
    game = new MonopolyGame(config);
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

  describe('#getPlayer', function() {
    it('should get a player by id', function() {
      let player = game.getPlayer('player-1');
      assert.ok(player && player instanceof MonopolyGame.Player);
    });

    it('should get a player by name', function() {
      let player = game.getPlayer('Player 1');
      assert.ok(player && player instanceof MonopolyGame.Player);
    });

    it('should return existing player instances', function() {
      let player = game.getPlayer(game.players[0]);
      assert.ok(player && player instanceof MonopolyGame.Player);
    });
  });

  describe('#getProperty', function() {
    it('should get a property by id', function() {
      let property = game.getProperty('oriental-avenue');
      assert.ok(property && property instanceof MonopolyGame.Property);
    });

    it('should get a property by name', function() {
      let property = game.getProperty('Oriental Avenue');
      assert.ok(property && property instanceof MonopolyGame.Property);
    });

    it('should return existing property instances', function() {
      let property = game.getProperty(game.properties[0]);
      assert.ok(property && property instanceof MonopolyGame.Property);
    });
  });

  describe('#getAsset', function() {
    it('should get a asset by id', function() {
      let asset = game.getAsset('jail-card');
      assert.ok(asset && asset instanceof MonopolyGame.Asset);
    });

    it('should get a asset by name', function() {
      let asset = game.getAsset('Jail Card');
      assert.ok(asset && asset instanceof MonopolyGame.Asset);
    });

    it('should return existing asset instances', function() {
      let asset = game.getAsset(game.assets[0]);
      assert.ok(asset && asset instanceof MonopolyGame.Asset);
    });
  });
});
