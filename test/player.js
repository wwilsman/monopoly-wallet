var _             = require('../app/helpers');
var MonopolyGame  = require('../app/game');
var MonopolyError = require('../app/game/error');
var assert        = require('assert');

describe('Player', function() {
  let config, game, player, property, asset, valued;

  config = _.loadJSONFile('./app/themes/classic/config.json');
  config.properties = _.loadJSONFile('./app/themes/classic/properties.json');
  config.assets = _.loadJSONFile('./app/themes/classic/assets.json');
  config.bank = config.start * 2;

  beforeEach(function() {
    game = new MonopolyGame(config);
    player = game.join({ name: 'Player 1' });
    property = game.properties[0];
    asset = game.assets.find((a) => !a.value);
    valued = game.assets.find((a) => a.value);
    game.bank.transfer(player, [...property.group, asset]);
  });

  it('should create new player', function() {
    assert.ok(player && player instanceof MonopolyGame.Player);
  });

  it('should not allow players to be named "bank"', function() {
    assert.throws(() => {
      game.join({ name: 'bank' });
    }, MonopolyError);
  });

  describe('#value', function() {
    it('should total balance and property values', function() {
      let groupValue = property.group.reduce((t, p) => t + p.value, 0);
      assert.equal(player.value, player.balance + groupValue);
    });
  });

  describe('#properties', function() {
    it('should contain properties owned by the player', function() {
      assert.notEqual(player.properties.indexOf(property), -1);
    });
  });

  describe('#assets', function() {
    it('should contain assets owned by the player', function() {
      assert.notEqual(player.assets.indexOf(asset), -1);
    });
  });

  describe('#transfer()', function() {
    it('should transfer money', function() {
      let b1 = player.balance;
      let b2 = game.bank.balance;
      let amount = 25;

      player.transfer(game.bank, amount);

      assert.equal(player.balance, b1 - amount);
      assert.equal(game.bank.balance, b2 + amount);
    });

    it('should transfer a property', function() {
      assert.equal(property.owner, player);

      player.transfer(game.bank, property);

      assert.equal(property.owner, game.bank);
    });

    it('should transfer an asset', function() {
      assert.equal(asset.owner, player);

      player.transfer(game.bank, asset);

      assert.equal(asset.owner, game.bank);
    });

    it('should transfer an asset\'s value', function() {
      let b1 = player.balance;
      let b2 = game.bank.balance;
      let amount = valued.value;

      assert.equal(valued.owner, game.bank);

      game.bank.transfer(player, valued);

      assert.equal(player.balance, b1 + amount);
      assert.equal(game.bank.balance, b2 - amount);
      assert.equal(valued.owner, game.bank);
    });

    it('should transfer multiple items', function() {
      let b1 = player.balance;
      let b2 = game.bank.balance;
      let amount = 25;

      assert.equal(property.owner, player);
      assert.equal(asset.owner, player);

      player.transfer(game.bank, [amount, property, asset]);

      assert.equal(player.balance, b1 - amount);
      assert.equal(game.bank.balance, b2 + amount);
      assert.equal(property.owner, game.bank);
      assert.equal(asset.owner, game.bank);
    });

    it('should not transfer more money than the player\'s balance', function() {
      assert.throws(() => {
        player.transfer(game.bank, player.balance + 1);
      }, MonopolyError);
    });

    it('should not transfer a property if it\'s improved', function() {
      player.improve(property);

      assert.ok(property.isImproved);

      assert.throws(() => {
        player.transfer(game.bank, property);
      }, MonopolyError);
    });

    it('should not transfer a property the player doesn\'t own', function() {
      assert.throws(() => {
        game.bank.transfer(player, property);
      }, MonopolyError);
    });

    it('should not transfer an asset the player doesn\'t own', function() {
      assert.throws(() => {
        game.bank.transfer(player, asset);
      }, MonopolyError);

      assert.throws(() => {
        player.transfer(game.bank, valued);
      }, MonopolyError);
    });

    it('should not transfer multiple items if an error occurs', function() {
      var b1 = player.balance;
      var b2 = game.bank.balance;

      assert.equal(property.owner, player);
      assert.equal(asset.owner, player);

      assert.throws(() => {
        player.transfer(game.bank, [player.balance + 1, property, asset]);
      }, MonopolyError);

      assert.equal(player.balance, b1);
      assert.equal(game.bank.balance, b2);
      assert.equal(property.owner, player);
      assert.equal(asset.owner, player);
    });
  });

  describe('#bankrupt()', function() {
    it('should mark the player as bankrupt', function() {
      assert.ok(!player.isBankrupt);

      game.bank.bankrupt(player);

      assert.ok(player.isBankrupt);
    });

    it('should sell all property improvements', function() {
      player.improve(property);

      assert.equal(property.buildings, 1);

      game.bank.bankrupt(player);

      assert.equal(property.buildings, 0);
    });

    it('should mortgage properties', function() {
      assert.ok(!property.isMortgaged);

      game.bank.bankrupt(player);

      assert.ok(property.isMortgaged);
    });
  });

  describe('#improve()', function() {
    it('should add to buildings', function() {
      assert.equal(property.buildings, 0);

      player.improve(property);

      assert.equal(property.buildings, 1);
    });

    it('should cost the player money', function() {
      let bal = player.balance;

      player.improve(property);

      assert.equal(player.balance, bal - property.cost);
    });

    it('should subtract from available houses', function() {
      let houses = game.houses;

      player.improve(property);

      assert.equal(game.houses, houses - 1);
    });

    it('should subtract from available hotels and add back houses', function() {
      let houses = game.houses;
      let hotels = game.hotels;
      let group = property.group;

      for (let i = 1; i <= 4; i++) {
        group.forEach((p) => player.improve(p));

        assert.equal(game.hotels, hotels);
        assert.equal(game.houses, houses - i * group.length);
      }

      group.forEach((p) => player.improve(p));

      assert.equal(game.houses, houses);
      assert.equal(game.hotels, hotels - group.length);
    });

    it('should not improve if railroad/utility', function() {
      let railroad = game.properties.find((p) => p._group === 'railroad');
      let utility = game.properties.find((p) => p._group === 'utility');
      game.bank.transfer(player, [railroad, utility]);

      assert.throws(() => {
        player.improve(railroad);
      }, MonopolyError);

      assert.equal(railroad.buildings, 0);

      assert.throws(() => {
        player.improve(utility);
      }, MonopolyError);

      assert.equal(utility.buildings, 0);
    });

    it('should not improve if not a monopoly', function() {
      player.transfer(game.bank, property);

      assert.throws(() => {
        player.improve(property);
      }, MonopolyError);
    });

    it('should not improve if already fully improved', function() {
      while (property.group.every((p) => !p.isFullyImproved)) {
        property.group.forEach((p) => player.improve(p));
      }

      assert.equal(property.buildings, 5);

      assert.throws(() => {
        player.improve(property);
      }, MonopolyError);

      assert.equal(property.buildings, 5);
    });

    it('should not improve unevenly', function() {
      player.improve(property);

      assert.equal(property.buildings, 1);

      assert.throws(() => {
        player.improve(property);
      }, MonopolyError);

      assert.equal(property.buildings, 1);
    });
  });

  describe('#unimprove()', function() {

    beforeEach(function() {
      property.group.forEach((p) => player.improve(p));
    });

    it('should remove from buildings', function() {
      assert.equal(property.buildings, 1);

      player.unimprove(property);

      assert.equal(property.buildings, 0);
    });

    it('should add to house building cap', function() {
      let houses = game.houses;

      player.unimprove(property);

      assert.equal(game.houses, houses + 1);
    });

    it('should add to hotel building cap', function() {
      while (property.group.some((p) => !p.isFullyImproved)) {
        property.group.forEach((p) => player.improve(p));
      }

      let hotels = game.hotels;

      player.unimprove(property);

      assert.equal(game.hotels, hotels + 1);
    });

    it('should not unimprove if railroad/utility', function() {
      let railroad = game.properties.find((p) => p._group === 'railroad');

      assert.throws(() => {
        player.unimprove(railroad);
      }, MonopolyError);
    });

    it('should not unimprove if already unimproved', function() {
      property.group.forEach((p) => player.unimprove(p));

      assert.throws(() => {
        player.unimprove(property);
      }, MonopolyError);
    });

    it('should not unimprove unevenly', function() {
      property.group.forEach((p) => player.improve(p));
      player.unimprove(property);

      assert.throws(() => {
        player.unimprove(property);
      }, MonopolyError);
    });
  });

  describe('#mortgage()', function() {
    it('should mortgage property', function() {
      assert.ok(!property.isMortgaged);

      player.mortgage(property);

      assert.ok(property.isMortgaged);
    });

    it('should not mortgage if already mortgaged', function() {
      player.mortgage(property);

      assert.throws(() => {
        player.mortgage(property);
      }, MonopolyError);
    });

    it('should not mortgage if property is improved', function() {
      player.improve(property);

      assert.throws(() => {
        player.mortgage(property);
      }, MonopolyError);
    });
  });

  describe('#unmortgage()', function() {
    it('should unmortgage property', function() {
      player.mortgage(property);

      assert.ok(property.isMortgaged);

      player.unmortgage(property);

      assert.ok(!property.isMortgaged);
    });

    it('should not unmortgage if not mortgaged', function() {
      assert.throws(() => {
        player.unmortgage(property);
      }, MonopolyError);
    });
  });
});
