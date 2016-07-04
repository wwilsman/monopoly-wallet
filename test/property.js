var _             = require('../app/helpers');
var MonopolyGame  = require('../app/game');
var MonopolyError = require('../app/game/error');
var assert        = require('assert');

describe('Property', function() {
  let config, game, player, property;

  config = _.loadJSONFile('./app/themes/classic/config.json');
  config.properties = _.loadJSONFile('./app/themes/classic/properties.json');
  config.bank = config.start * 2;

  beforeEach(function () {
    game = new MonopolyGame(config);
    player = game.join({ name: 'Player 1' });
    property = game.properties[0];
    game.bank.transfer(player, property.group);
  });

  it('should create a new property', function() {
    assert.ok(property && property instanceof MonopolyGame.Property);
  });

  describe('#isMonopoly', function() {
    it('should be monopoly', function() {
      assert.ok(property.isMonopoly);
    });

    it('should not be monopoly', function() {
      player.transfer(game.bank, property);

      assert.ok(!property.isMonopoly);
    });
  });

  describe('#group', function() {
    it('should list all properties in group', function() {
      assert.ok(property.group.every((p) => p._group === property._group));
    });
  });

  describe('#value', function() {
    it('should total mortgage and building values', function() {
      player.improve(property);

      let value = property.mortgage + property.improvementValue;

      assert.equal(property.value, value);
    });
  });

  describe('#rent', function() {

    it('should return unimproved', function() {
      player.transfer(game.bank, property);

      assert.equal(property._rent[0], property.rent);
    });

    it('should return doubled due to monopoly', function() {
      assert.equal(property._rent[0] * 2, property.rent);
    });

    it('should return rent based on improvements', function() {
      property.group.forEach((p) => player.improve(p));

      assert.equal(property._rent[1], property.rent);

      property.group.forEach((p) => player.improve(p));

      assert.equal(property._rent[2], property.rent);

      property.group.forEach((p) => player.improve(p));

      assert.equal(property._rent[3], property.rent);

      property.group.forEach((p) => player.improve(p));

      assert.equal(property._rent[4], property.rent);

      property.group.forEach((p) => player.improve(p));

      assert.equal(property._rent[5], property.rent);
    });

    it('should return proper rent values for railroads/utilities', function() {
      let railroad = game.properties.find((p) => p._group === 'railroad');
      game.bank.transfer(player, railroad);

      assert.equal(railroad._rent[0], railroad.rent);

      game.bank.transfer(player, railroad.group[1]);

      assert.equal(railroad._rent[1], railroad.rent);
    });
  });

  describe('#owner', function() {
    it('should return the player who owns this property', function() {
      assert.equal(property.owner, player);
    });
  });
});
