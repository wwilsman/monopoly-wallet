Property = (function () {

  // The Property Class
  // ==================

  // ```
  // property = {
  //   token: owner.token,
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

    // New properties start with these defaults
    this.token = 'bank';
    this.buildings = 0;
    this.mortgaged = false;
    this.monopoly = false;

    // Set properties
    _.extend(this, props);

    this.costs.mortgage = this.costs.price * 1.1;

    this.values = {
      mortgage: this.costs.price / 2,
      building: this.costs.building / 2
    };

    // Add this property to the collection
    Property.collection[this.name] = this;
  }


  // Static Properties
  // -----------------

  // Total available houses
  Property.availableHouses = 32;

  // Total available hotels
  Property.availableHotels = 12;

  // Collection of all properties indexed by name
  Property.collection = {};


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
      if (this.buildings === 5) {
        throw Error('Already fully improved');
      }

      // Must build evenly
      if (!_.equalProps(this.all, 'buildings')) {
        throw Error('Must build evenly');
      }

      // No more houses
      if (this.buildings < 4 && Property.availableHouses === 0) {
        throw Error('No more houses');
      }

      // No more hotels
      if (this.buildings === 4 && Property.availableHotels === 0) {
        throw Error('No more hotels');
      }

      // Add building
      this.buildings += 1;

      // Subtract building from cap
      if (this.buildings === 5) {
        Property.availableHotels -= 1;
      } else {
        Property.availableHouses -= 1;
      }
    },

    // Unimprove property
    unimprove: function() {

      // Already fully unimproved
      if (this.buildings === 0) {
        throw Error('Already fully unimproved');
      }

      // Remove building
      this.buildings -= 1;

      // Must build evenly
      if (!_.equalProps(this.all, 'buildings')) {

        // Add back building
        this.buildings += 1;

        throw Error('Must build evenly');
      }

      // Add building to cap
      if (this.buildings === 4) {
        Property.availableHotels += 1;
      } else {
        Property.availableHouses += 1;
      }
    },

    // Is property improved?
    get isImproved() {
      return this.buildings > 0;
    },

    // Transfer property
    transfer: function(player) {

      // Remove the property from the current owner
      delete this.owner.properties[this.name];

      // New owner
      this.token = player.token;

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
    get all() {
      var all = [];

      // Get all properties in group
      for (var propName in Property.collection) {
        if (this.group === Property.collection[propName].group) {
          all.push(Property.collection[propName]);
        }
      }

      return all;
    },

    // Is property a monopoly?
    get isMonopoly() {
      
      // Return true if all properties in group are owned by the same player
      return _.equalProps(this.all, 'owner');
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
      return Player.get(this.token);
    }
  };

  return Property;

})();
