var assert = require('assert');
var _ = require('../lib/helpers');
var MonopolyGame = require('../lib/main');
var MonopolyError = require('../lib/error');

describe('Property', function() {
  var prop1, prop2, player,
    M = new MonopolyGame;

  beforeEach(function () {
    prop1 = new M.Property({
      owner: '1',
      name: 'property 1',
      group: 'group name',
      costs: {
        price: 60,
        build: 50,
        rent: [0, 1, 2, 3, 4, 5]
      }
    });

    prop2 = new M.Property({
      owner: '1',
      name: 'property 2',
      group: 'group name',
      costs: {
        price: 60,
        build: 50,
        rent: [0, 1, 2, 3, 4, 5]
      }
    });

    player = new M.Player({
      name: '1'
    });
  });

  afterEach(function() {
    M.properties.length = 0;
    M.players.length = 1;
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

    it('should subtract from house building cap', function() {
      var houses = M.availableHouses;

      prop1.improve();

      assert.equal(houses - 1, M.availableHouses);
    });

    it('should subtract from hotel building cap', function() {
      var hotels = M.availableHotels;

      prop1.buildings = 4;
      prop2.buildings = 4;
      prop2.improve();

      assert.equal(hotels - 1, M.availableHotels);
    });

    it('should not improve if not monopoly', function() {
      prop2.transfer(M.Bank);

      assert.throws(function() {
        prop1.improve();
      }, MonopolyError.MonopolyError);
    });

    it('should not improve if fully improved', function() {
      prop1.buildings = 5;
      prop2.buildings = 5;

      assert.throws(function() {
        prop1.improve();
      }, MonopolyError.FullImprovementError);
    });

    it('should not improve unevenly', function() {
      prop1.buildings = 1;

      assert.throws(function() {
        prop1.improve();
      }, MonopolyError.BuildEvenlyError);
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

    it('should add to house building cap', function() {
      var houses;

      prop1.improve();
      houses = M.availableHouses;
      prop1.unimprove();

      assert.equal(houses + 1, M.availableHouses);
    });

    it('should add to hotel building cap', function() {
      var hotels = M.availableHotels;

      prop1.buildings = 5;
      prop2.buildings = 5;
      prop2.unimprove();

      assert.equal(hotels + 1, M.availableHotels);
    });

    it('should not unimprove if already unimproved', function() {
      assert.throws(function() {
        prop1.unimprove();
      }, MonopolyError.UnimprovementError);
    });

    it('should not unimprove unevenly', function() {
      prop1.buildings = 1;
      prop2.buildings = 2;

      assert.throws(function() {
        prop1.unimprove();
      }, MonopolyError.BuildEvenlyError);
    });
  });

  describe('#mortgage()', function() {
    it('should mortgage property', function() {
      assert.ok(!prop1.isMortgaged);

      prop1.mortgage();

      assert.ok(prop1.isMortgaged);
    });

    it('should not mortgage if already mortgaged', function() {
      prop1.mortgage();

      assert.throws(function() {
        prop1.mortgage();
      }, MonopolyError.MortgageError);
    });

    it('should not mortgage if property is improved', function() {
      prop1.improve();

      assert.throws(function() {
        prop1.mortgage();
      }, MonopolyError.ImprovementError);
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

    it('should not unmortgage if not mortgaged', function() {
      assert.throws(function() {
        prop1.unmortgage();
      }, MonopolyError.UnmortgageError);
    });
  });

  describe('#isMonopoly', function() {
    it('should be monopoly', function() {
      assert.ok(prop1.isMonopoly);
    });

    it('should not be monopoly', function() {
      prop2.transfer(M.Bank);
      assert.ok(!prop1.isMonopoly);
    });
  });

  describe('#group', function() {
    it('should list all properties in group', function() {
      assert.ok(prop1.group.indexOf(prop2));
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
      prop2.transfer(M.Bank);
      assert.equal(prop1.costs.rent[0], prop1.rent);
    });

    it('should return doubled due to monopoly', function() {
      assert.equal(prop1.costs.rent[0] * 2, prop1.rent);
    });
    
    it('should return rent with one house', function() {
      prop1.buildings = 1;
      assert.equal(prop1.costs.rent[1], prop1.rent);
    });
    
    it('should return rent with two houses', function() {
      prop1.buildings = 2;
      assert.equal(prop1.costs.rent[2], prop1.rent);
    });
    
    it('should return rent with three houses', function() {
      prop1.buildings = 3;
      assert.equal(prop1.costs.rent[3], prop1.rent);
    });
    
    it('should return rent with four houses', function() {
      prop1.buildings = 4;
      assert.equal(prop1.costs.rent[4], prop1.rent);
    });
    
    it('should return rent with one hotel', function() {
      prop1.buildings = 5;
      assert.equal(prop1.costs.rent[5], prop1.rent);
    });
  });

  describe('#owner', function() {
    it('should return the player who owns this property', function() {
      assert.equal(prop1.owner, player);
    });
  });
});
