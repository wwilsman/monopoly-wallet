var _ = require('./helpers');
var MonopolyAssert = require('./assert');

module.exports = function (M) {

  // The Property Class
  // ==================

  // ```
  // props = {
  //   owner: owner.name,
  //   name: 'property name',
  //   group: 'group name',
  //   buildings: 0,
  //   mortgaged: false,
  //   costs: {
  //     price: 60,
  //     build: 50,
  //     rent: [0, 1, 2, 3, 4, 5]
  //   }
  // };
  // ```

  function Property(props) {

    // Correct owner
    if (props.owner) {
      props.ownerName = props.owner;
      delete props.owner;
    }

    // Correct group
    props.groupName = props.group;
    delete props.group;

    // Set properties (with defaults)
    _.extend(this, {
      buildings: 0,
      mortgaged: false,
      ownerName: 'bank'
    }, props);

    // Set this property's cost to mortgage
    this.costs.mortgage = Math.round(this.costs.price * M.rates.unmortgage);

    // Set this property's values
    this.values = {
      mortgage: Math.round(this.costs.price * M.rates.mortgage),
      building: Math.round(this.costs.build * M.rates.building)
    };

    // Add this property to the collection
    Property.collection[this.name] = this;
  }


  // Static Properties
  // -----------------

  // Collection of all properties indexed by name
  Property.collection = {};


  // Static Methods
  // -----------------

  // Get the named property
  Property.get = function(name) {
    var property = Property.collection[name];

    // Property doesn't exist
    MonopolyAssert('Unknown property "%s"', !property, name);

    return property;
  };

  // Get all properties associated with a player
  Property.belongsTo = function(player) {
    var name, prop, 
      properties = {};

    for (name in Property.collection) {
      prop = Property.collection[name];

      // Property belongs to **player**
      if (player === prop.owner) {
        properties[name] = prop;
      }
    }

    return properties;
  };


  // Property Methods
  // ----------------

  Property.prototype = {

    // Improve property
    improve: function() {
      var needsHotel = this.buildings === 4;

      // Needs to be a monopoly
      MonopolyAssert('MonopolyError', !this.isMonopoly, this.name);

      // Already fully improved
      MonopolyAssert('FullImprovementError', this.isFullyImproved, this.name);

      // Must build evenly
      MonopolyAssert('BuildEvenlyError', !this.isImprovedEvenly, this.name);

      // Property needs a hotel
      if (needsHotel) {

        // Not enough hotels
        MonopolyAssert('AvailabilityError', M.availableHotels < 1, 'hotels');
        
        // Adjust available buildings
        M.availableHotels -= 1;
        M.availableHouses += 4;

      // Property needs a house
      } else {
        
        // Not enough houses
        MonopolyAssert('AvailabilityError', M.availableHouses < 1, 'houses');

        // Adjust available houses
        M.availableHouses -= 1;
      }

      // Add building
      this.buildings += 1;
    },

    // Unimprove property
    unimprove: function() {

      // Already fully unimproved
      MonopolyAssert('UnimprovementError', !this.isImproved, this.name);

      // Must build evenly
      MonopolyAssert('BuildEvenlyError', !this.isUnimprovedEvenly);

      // Property has hotel
      if (this.isFullyImproved) {

        // Not enough houses
        MonopolyAssert('AvailabilityError', M.availableHouses < 4, 'houses');

        // Adjust available buildings
        M.availableHotels += 1;
        M.availableHouses -= 4;

      // Property doesn't have hotel
      } else {

        // Adjust available houses
        M.availableHouses += 1;
      }

      // Remove building
      this.buildings -= 1;
    },

    // Is property improved?
    get isImproved() {
      return this.buildings > 0;
    },

    // Is any property in group improved?
    get anyImproved() {
      return this.group.some(function(prop) {
        return prop.isImproved;
      });
    },

    // Is property fully improved?
    get isFullyImproved() {
      return this.buildings === 5;
    },

    // Is property being improved evenly
    get isImprovedEvenly() {
      var count = this.buildings;

      // Buildings are equal to or one more than others in group
      return this.group.every(function(prop) {
        return count === prop.buildings || count + 1 === prop.buildings;
      });
    },

    // Is property being unimproved evenly
    get isUnimprovedEvenly() {
      var count = this.buildings;

      // Buildings are equal to or one less than others in group
      return this.group.every(function(prop) {
        return count === prop.buildings || count - 1 === prop.buildings;
      });
    },

    // Transfer property
    transfer: function(player) {

      // Property in group has improvements
      MonopolyAssert('ImprovementError', this.anyImproved, this.name);

      // Remove the property from the current owner
      delete this.owner.properties[this.name];

      // New owner
      this.owner = player;

      // Add the property to the new owner
      this.owner.properties[this.name] = this;
    },

    // Mortgage property
    mortgage: function() {

      // Property is already mortgaged
      MonopolyAssert('MortgageError', this.isMortgaged, this.name);

      // Property in group has improvements
      MonopolyAssert('ImprovementError', this.anyImproved, this.name);

      this.mortgaged = true;
    },

    // Unmortgage property
    unmortgage: function() {

      // Property is not mortgaged
      MonopolyAssert('UnmortgageError', !this.isMortgaged, this.name);

      this.mortgaged = false;
    },

    // Is property mortgaged?
    get isMortgaged() {
      return this.mortgaged;
    },

    // All properties within this property's group
    get group() {
      var group = [];

      // Get all properties in group
      for (var propName in Property.collection) {
        if (this.groupName === Property.collection[propName].groupName) {
          group.push(Property.collection[propName]);
        }
      }

      return group;
    },

    // Is property a monopoly?
    get isMonopoly() {
      var group = this.group,
        ret = true;

      // Check if all other properties in group are owned by the same player
      for (var i = 0, l = group.length - 1; i < l; i++) {
        ret = ret && group[i].owner === group[i + 1].owner;
      }

      return ret;
    },

    // Property's total value
    get value() {

      // Start with property's mortgage value
      var total = this.values.mortgage;

      // Add value of combined buildings
      total += this.buildings * this.values.building;

      return total;
    },

    // Property's rent
    get rent() {

      // Monopoly doubles unimporoved rent
      if (this.isMonopoly && this.buildings === 0) {
        return this.costs.rent[0] * 2;
      }

      return this.costs.rent[this.buildings];
    },

    // Property's owner
    get owner() {
      return M.Player.get(this.ownerName);
    },

    // Set property's owner
    set owner(player) {
      this.ownerName = player.name;
      return player;
    }
  };

  return Property;

};
