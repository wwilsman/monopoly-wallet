Monopoly.Property = (function () {

  var config = Monopoly.config;

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
  //     building: 50,
  //     rent: [0, 1, 2, 3, 4, 5]
  //   }
  // };
  // ```

  function Property(props) {

    // Correct owner
    props.ownerName = props.owner;
    delete props.owner;

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
    this.costs.mortgage = this.costs.price * config.rates.mortgage;

    // Set this property's values
    this.values = {
      mortgage: this.costs.price * config.rates.unmortgage,
      building: this.costs.building * config.rates.building
    };

    // Add this property to the collection
    Property.collection[this.name] = this;
  }


  // Static Properties
  // -----------------

  // Collection of all properties indexed by name
  Property.collection = Monopoly.properties;


  // Static Methods
  // -----------------

  // Get the named property
  Property.get = function(name) {
    var property = Property.collection[name];

    // Show error if property doesn't exist in the collection
    if (!property) {
      throw Error('Unknown Property "' + name + '"');
    }

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

      // Needs to be a monopoly
      if (!this.isMonopoly) {
        throw Error('Needs to be a monopoly');
      }

      // Already fully improved
      if (this.isFullyImproved) {
        throw Error('Already fully improved');
      }

      // Must build evenly
      // this equal to or one less than others
      if (!this.isImprovedEvenly) {
        throw Error('Must build evenly');
      }

      // No more houses
      if (this.buildings < 4 && config.availableHouses === 0) {
        throw Error('No more houses');
      }

      // No more hotels
      if (this.buildings === 4 && config.availableHotels === 0) {
        throw Error('No more hotels');
      }

      // Add building
      this.buildings += 1;

      // Subtract building from cap
      if (this.isFullyImproved) {
        config.availableHotels -= 1;
      } else {
        config.availableHouses -= 1;
      }
    },

    // Unimprove property
    unimprove: function() {

      // Already fully unimproved
      if (!this.isImproved) {
        throw Error('Property is not improved');
      }

      // Must build evenly
      if (!this.isUnimprovedEvenly) {
        throw Error('Must build evenly');
      }

      // Add building to cap
      if (this.isFullyImproved) {
        config.availableHotels += 1;
      } else {
        config.availableHouses += 1;
      }

      // Remove building
      this.buildings -= 1;
    },

    // Is property improved?
    get isImproved() {
      return this.buildings > 0;
    },

    // Is property fully improved?
    get isFullyImproved() {
      return this.buildings === 5;
    },

    // Is property being improved evenly
    get isImprovedEvenly() {
      var count = this.buildings;

      // Buildings are equal to or one less than others in group
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
      if (this.isMortgaged) {
        throw Error('Property is already mortgaged');
      }

      // Property is improved
      if (this.isImproved) {
        throw Error('Property is improved');
      }

      this.mortgaged = true;
    },

    // Unmortgage property
    unmortgage: function() {

      // Property is not mortgaged
      if (!this.isMortgaged) {
        throw Error('Property is not mortgaged');
      }

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
      return Monopoly.Player.get(this.ownerName);
    },

    // Set property's owner
    set owner(player) {
      this.ownerName = player.name;
      return player;
    }
  };

  return Property;

})();
