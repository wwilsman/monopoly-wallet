Property = (function () {

  // The Property Class
  // ==================

  function Property(props) {

    // Set properties
    _.extend(this, props);

    // New properties start with these defaults
    this.token = this.token || 'bank';
    this.buildings = this.buildings || 0;
    this.mortgaged = this.mortgaged || false;
    this.monopoly = this.monopoly || false;

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

        // Create group if it doesn't exist
        properties[prop.group] = properties[prop.group] || {};

        // Add property to group
        properties[prop.group][name] = prop;
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
      if (this.buildings === 0) {
        throw Error('Already fully improved');
      }

      // Must build evenly
      if (!_.equalProps(this.all, 'buildings')) {
        throw Error('Must build evenly');
      }

      this.building += 1;
    },

    // Unimprove property
    unimprove: function() {

      // Already fully unimproved
      if (this.buildings === 0) {
        throw Error('Already fully unimproved');
      }

      // Must build evenly
      if (!_.equalProps(this.all, 'buildings')) {
        throw Error('Must build evenly');
      }

      // Must build evenly

      this.building -= 1;
    },

    // Is property improved?
    get isImproved() {
      return this.buildings > 0;
    },

    // Transfer property
    transfer: function(player) {

      // Remove the property from the current owner
      delete this.owner.properties[this.group][this.name];

      // Remove the group if the current owner has no others from the group
      if (_.keys(this.owner.properties[this.group]).length === 0) {
        delete this.owner.properties[this.group];
      }

      // New owner
      this.owner = player;

      // Add the group if new owner has no other from the group
      if (!this.owner.properties[this.group]) {
        this.owner.properties[this.group] = {};
      }

      // Add the property to the new owner
      this.owner.properties[this.group][this.name] = this;
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
      var total = this.mortgageValue;

      // Add value of combined buildings
      total += this.buildings * this.buildingValue;

      return total;
    },

    // Get Property's owner
    get owner() {
      return Player.get(this.token);
    },

    // Set Property's owner
    set owner(owner) {
      this.token = owner.token;
      return owner;
    }
  };

  return Property;

})();
