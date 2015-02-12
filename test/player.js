var assert = require('assert');
var Monopoly = require('./monopoly');

describe('Player', function() {
  var p1, p2, prop;

  beforeEach(function () {
    prop = new Monopoly.Property({
      owner: '1',
      name: 'property name',
      group: 'group name',
      costs: {
        price: 60,
        build: 50,
        rent: [0, 1, 2, 3, 4, 5]
      }
    });

    p1 = new Monopoly.Player({
      name: '1',
      assets: {
        jailcard: 1
      }
    });

    p2 = new Monopoly.Player({
      name: '2',
    });
  });

  afterEach(function() {
    _.emptyObj(Monopoly.properties);
    _.emptyObj(Monopoly.players);
  });

  it('should be created', function() {
    assert.ok(p1);
  });

  describe('#buy()', function() {
    it('should buy named property from another player', function() {
      assert.equal(prop.owner, p1);

      p2.buy(prop.name);

      assert.equal(prop.owner, p2);
    });

    it('should not buy if player balance is low', function() {
      assert.throws(function() {
        p2.buy(prop.name, p2.balance + 1);
      }, Monopoly.Error.LowBalanceError)
    });

    it('should not buy property if improved', function() {
      p1.improve(prop);

      assert.throws(function() {
        p2.buy(prop.name);
      }, Monopoly.Error.ImprovementError)
    });
  });

  describe('#transfer()', function() {
    it('should transfer currency', function() {
      var amount = 25;
      var b1 = p1.balance;
      var b2 = p2.balance;

      p1.transfer(p2, amount);

      assert.equal(b1 - amount, p1.balance);
      assert.equal(b2 + amount, p2.balance);
    });

    it('should transfer one property', function() {
      assert.equal(prop.owner, p1);
      assert.notEqual(prop.owner, p2);

      p1.transfer(p2, prop);

      assert.notEqual(prop.owner, p1);
      assert.equal(prop.owner, p2);
    });

    it('should transfer all properties', function() {
      assert.equal(prop.owner, p1);
      assert.notEqual(prop.owner, p2);

      p1.transfer(p2, 'properties');

      assert.notEqual(prop.owner, p1);
      assert.equal(prop.owner, p2);
    });

    it('should transfer one asset', function() {
      assert.equal(p1.assets.jailcard, 1);
      assert.notEqual(p2.assets.jailcard, 1);

      p1.transfer(p2, 'jailcard');

      assert.notEqual(p1.assets.jailcard, 1);
      assert.equal(p2.assets.jailcard, 1);
    });

    it('should transfer all assets', function() {
      assert.equal(p1.assets.jailcard, 1);
      assert.notEqual(p2.assets.jailcard, 1);

      p1.transfer(p2, 'assets');

      assert.notEqual(p1.assets.jailcard, 1);
      assert.equal(p2.assets.jailcard, 1);
    });

    it('should not transfer currency if low balance', function() {
      assert.throws(function() {
        p1.transfer(p2, p1.balance + 1);
      }, Monopoly.Error.LowBalanceError);
    });

    it('should not transfer property if improved', function() {
      assert.throws(function() {
        p1.improve(prop);
        p1.transfer(p1, prop);
      }, Monopoly.Error.ImprovementError);
    });

    it('should not transfer an asset if there is none', function() {
      assert.throws(function() {
        p2.transfer(p1, 'jailcard');
      }, Monopoly.Error.OwnerError);
    });
  });

  describe('#improve()', function() {
    it('should improve property', function() {
      assert.ok(!prop.isImproved);

      p1.improve(prop);

      assert.ok(prop.isImproved);
    });

    it('should subtract from balance', function() {
      var balance = p1.balance;

      p1.improve(prop);

      assert.equal(balance - prop.costs.build, p1.balance);
    });

    it('should not improve if not player\'s property', function() {
      assert.throws(function() {
        p2.improve(prop);
      }, Monopoly.Error.OwnerError);
    });

    it('should not improve if low balance', function() {
      assert.throws(function() {
        p1.balance = 1;
        p1.improve(prop);
      }, Monopoly.Error.LowBalanceError);
    });
  });

  describe('#unimprove()', function() {
    it('should unimprove property', function() {
      assert.ok(!prop.isImproved);

      p1.improve(prop);

      assert.ok(prop.isImproved);
    });

    it('should add to balance', function() {
      var balance;

      p1.improve(prop);
      balance = p1.balance;
      p1.unimprove(prop);

      assert.equal(balance + prop.values.building, p1.balance);
    });

    it('should not unimprove if not player\'s property', function() {
      assert.throws(function() {
        p1.improve(prop);
        p2.unimprove(prop);
      }, Monopoly.Error.OwnerError);
    });
  });

  describe('#mortgage()', function() {
    it('should mortgage property', function() {
      assert.ok(!prop.isMortgaged);

      p1.mortgage(prop);

      assert.ok(prop.isMortgaged);
    });

    it('should add to balance', function() {
      var balance = p1.balance;

      p1.mortgage(prop);

      assert.equal(balance + prop.values.mortgage, p1.balance);
    });

    it('should not mortgage if not player\'s property', function() {
      assert.throws(function() {
        p2.mortgage(prop);
      }, Monopoly.Error.OwnerError);
    });
  });

  describe('#unmortgage()', function() {
    it('should unmortgage property', function() {
      assert.ok(!prop.isMortgaged);

      p1.mortgage(prop);

      assert.ok(prop.isMortgaged);

      p1.unmortgage(prop);

      assert.ok(!prop.isMortgaged);
    });

    it('should subtract from balance', function() {
      var balance;

      p1.mortgage(prop);
      balance = p1.balance;
      p1.unmortgage(prop);

      assert.equal(balance - prop.costs.mortgage, p1.balance);
    });

    it('should not unmortgage if not player\'s property', function() {
      p1.mortgage(prop);

      assert.throws(function() {
        p2.unmortgage(prop);
      }, Monopoly.Error.OwnerError);
    });

    it('should not unmortgage if low balance', function() {
      p1.mortgage(prop);
      p1.balance = 1;

      assert.throws(function() {
        p1.unmortgage(prop);
      }, Monopoly.Error.LowBalanceError);
    });
  });

  describe('#bankrupt()', function() {
    it('should bankrupt player', function() {
      assert.ok(!p1.isBankrupt);

      p1.bankrupt(p2);

      assert.ok(p1.isBankrupt);
    });

    it('should mortgage properties', function() {
      assert.ok(!prop.isMortgaged);

      p1.bankrupt(p2);

      assert.ok(prop.isMortgaged);
    });
  });

  describe('#value', function() {
    it('should total balance and property values', function() {
      assert.equal(p1.balance + prop.value, p1.value);
    });
  });

  describe('#properties', function() {
    it('should contain properties owned by player', function() {
      assert.ok(p1.properties[prop.name]);
    });
  });
});
