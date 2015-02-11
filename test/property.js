var assert = require('assert');
var fs = require('fs');

eval(fs.readFileSync('./lib/utilities.js').toString());
eval(fs.readFileSync('./lib/Property.js').toString());
eval(fs.readFileSync('./lib/Player.js').toString());

describe('Property', function() {
  var prop1, prop2, player;

  beforeEach(function () {
    prop1 = new Property({
      token: '1',
      name: 'property 1',
      group: 'group name',
      costs: {
        price: 60,
        building: 50,
        rent: [0, 1, 2, 3, 4, 5]
      }
    });

    prop2 = new Property({
      token: '1',
      name: 'property 2',
      group: 'group name',
      costs: {
        price: 60,
        building: 50,
        rent: [0, 1, 2, 3, 4, 5]
      }
    });

    player = new Player({
      token: '1'
    });
  });

  it('should be created', function() {
    assert.ok(prop1);
  });

  describe('#improve()', function() {
    it('should add to buildings', function() {
      assert.equal(0, prop1.buildings);

      prop1.improve();

      assert.equal(1, prop1.buildings);
    });
  });

  describe('#unimprove()', function() {
    it('should remove from buildings', function() {
      assert.equal(0, prop1.buildings);

      prop1.improve();

      assert.equal(1, prop1.buildings);

      prop1.unimprove();

      assert.equal(0, prop1.buildings);
    });
  });

  describe('#mortgage()', function() {
    it('should mortgage property', function() {
      assert.ok(!prop1.isMortgaged);

      prop1.mortgage();

      assert.ok(prop1.isMortgaged);
    });
  });

  describe('#unmortgage()', function() {
    it('should unmortgage property', function() {
      assert.ok(!prop1.isMortgaged);

      prop1.mortgage();

      assert.ok(prop1.isMortgaged);

      prop1.unmortgage();

      assert.ok(!prop1.isMortgaged);
    });
  });

  describe('#all', function() {
    it('should list all properties in group', function() {
      assert.ok(prop1.all.indexOf(prop2));
    });
  });

  describe('#value', function() {
    it('should total mortgage and building values', function() {
      prop1.improve();
      assert.equal(prop1.values.mortgage + prop1.values.building, prop1.value);
    });
  });

  describe('#rent', function() {
    it('should return unimproved', function() {
      var bank = new Player({ token: 'bank' });
      prop2.transfer(bank);
      assert.equal(prop1.costs.rent[0], prop1.rent);
    });

    it('should return doubled due to monopoly', function() {
      assert.equal(prop1.costs.rent[0] * 2, prop1.rent);
    });
    
    it('should return rent with one house', function() {
      prop1.improve();
      assert.equal(prop1.costs.rent[1], prop1.rent);
    });
    
    it('should return rent with two houses', function() {
      prop1.improve();
      prop1.improve();
      assert.equal(prop1.costs.rent[2], prop1.rent);
    });
    
    it('should return rent with three houses', function() {
      prop1.improve();
      prop1.improve();
      prop1.improve();
      assert.equal(prop1.costs.rent[3], prop1.rent);
    });
    
    it('should return rent with four houses', function() {
      prop1.improve();
      prop1.improve();
      prop1.improve();
      prop1.improve();
      assert.equal(prop1.costs.rent[4], prop1.rent);
    });
    
    it('should return rent with one hotel', function() {
      prop1.improve();
      prop1.improve();
      prop1.improve();
      prop1.improve();
      prop1.improve();
      assert.equal(prop1.costs.rent[5], prop1.rent);
    });
  });

  describe('#owner', function() {
    it('should return the player who owns this property', function() {
      assert.equal(prop1.owner, player);
    });
  });
});
