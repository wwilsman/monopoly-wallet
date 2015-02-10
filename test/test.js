var assert = require('assert');
var fs = require('fs');

eval(fs.readFileSync('./lib/utilities.js').toString());
eval(fs.readFileSync('./lib/Property.js').toString());
eval(fs.readFileSync('./lib/Player.js').toString());

describe('Player', function() {
  var p1, p2, prop;

  beforeEach(function () {
    prop = new Property({
      token: '1',
      name: 'property name',
      group: 'group name',
      rent: [0, 1, 2, 3, 4, 5],
      costs: {
        property: 60,
        building: 50
      }
    });

    p1 = new Player({
      token: '1',
      assets: {
        jailcard: 1
      }
    });

    p2 = new Player({
      token: '2',
    });
  });

  it('should be created', function() {
    assert.ok(p1);
  });

  describe('#transfer', function() {
    it('should transfer currency', function() {
      var amount = 25;
      var b1 = p1.balance;
      var b2 = p2.balance;

      p1.transfer(p2, amount);

      assert.equal(b1 - amount, p1.balance);
      assert.equal(b2 + amount, p2.balance);
    });

    it('should transfer properties', function() {
      assert.equal(prop.owner, p1);
      assert.notEqual(prop.owner, p2);

      p1.transfer(p2, prop);

      assert.notEqual(prop.owner, p1);
      assert.equal(prop.owner, p2);

      p2.transfer(p1, 'properties');

      assert.equal(prop.owner, p1);
      assert.notEqual(prop.owner, p2);
    });

    it('should transfer assets', function() {
      assert.equal(p1.assets.jailcard, 1);
      assert.notEqual(p2.assets.jailcard, 1);

      p1.transfer(p2, 'jailcard');

      assert.notEqual(p1.assets.jailcard, 1);
      assert.equal(p2.assets.jailcard, 1);

      p2.transfer(p1, 'assets');

      assert.equal(p1.assets.jailcard, 1);
      assert.notEqual(p2.assets.jailcard, 1);
    });
  });
});
