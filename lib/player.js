var _ = require('./helpers');
var MonopolyAssert = require('./assert');

module.exports = function (M) {

  // The Player Class
  // ==================

  // ```
  // props = {
  //   name: 'player name',
  //   token: 'string',
  //   balance: 1500,
  //   assets: {
  //     jailcards: 2
  //   }
  // };
  // ```

  function Player(props) {

    // Prevent players from being named "bank" or having the bank token
    MonopolyAssert('Player cannot be named "bank"',
      M.Bank && (props.name === 'bank' || props.token === "bank"));

    // Set properties with defaults
    _.extend(this, {
      balance: M.startBalance,
      assets: {}
    }, props);

    // Add this Player to the collection
    Player.collection[this.name] = this;
  }


  // Static Properties
  // -----------------

  // Collection of all players indexed by player name
  Player.collection = {};


  // Static Methods
  // -----------------

  // Get the player
  Player.get = function(name) {
    var player = Player.collection[name];

    // Player doesn't exist
    MonopolyAssert('Unknown player "%s"', !player, name);

    return player;
  };
  

  // Player Methods
  // ----------------

  Player.prototype = {

    // Buy a named property for an optional set price
    buy: function(propName, price) {
      var property = M.Property.get(propName),
        owner = property.owner;

      // **price** defaults to property price
      if (typeof price !== 'number') {
        price = property.costs.price;
      }

      // Transfer the price to the owner
      this.transfer(owner, price);

      // Attempt to transfer the property from the owner
      try {
        owner.transfer(this, property);

      // Transfer the price back before erroring
      } catch (e) {
        owner.transfer(this, price);
        throw e;
      }
    },

    // Transfer ownership to another player
    transfer: function(player, what) {
      var property;

      switch (what) {

      // Transfer balance
      case 'balance':

        player.balance += this.balance;
        this.balance -= this.balance;

        break;

      // Transfer assets
      case 'assets':

        for (var asset in this.assets) {

          // Create asset if none exist
          if (!player.assets[asset]) {
            player.assets[asset] = 0;
          }

          player.assets[asset] += this.assets[asset];
          delete this.assets[asset];
        }

        break;

      // Transfer properties
      case 'properties':

        for (var propName in this.properties) {
          this.properties[propName].transfer(player);
        }

        break;

      // Not a bulk transfer
      default:

        // Transfer an amount of currency
        if (typeof what === 'number') {

          // Player doesn't have enough currency
          MonopolyAssert('LowBalanceError', what >= this.balance);

          player.balance += what;
          this.balance -= what;

        // Transfer an asset
        } else if (typeof what === 'string') {

          // Player doesn't own asset
          MonopolyAssert('OwnerError', !this.assets[what], 'any ' + what);

          // Create asset if none exist
          if (!player.assets[what]) {
            player.assets[what] = 0;
          }

          player.assets[what] += 1;
          this.assets[what] -= 1;

          // Remove asset if none exist
          if (this.assets[what] === 0) {
            delete this.assets[what];
          }

        // Assume we're transferring a property
        } else {
          what.transfer(player);
        }

        break;
      }
    },

    // Improve property
    improve: function(property) {

      // Player is not **property** owner
      MonopolyAssert('OwnerError', this !== property.owner, property.name);

      // Player doesn not have enough currency
      MonopolyAssert('LowBalanceError', property.costs.build >= this.balance);

      property.improve();
      this.balance -= property.costs.build;
    },

    // Unimprove property
    unimprove: function(property) {

      // Player is not **property** owner
      MonopolyAssert('OwnerError', this !== property.owner, property.name);

      property.unimprove();
      this.balance += property.values.building;
    },

    // Mortgage property
    mortgage: function(property) {

      // Player is not **property** owner
      MonopolyAssert('OwnerError', this !== property.owner, property.name);

      property.mortgage();
      this.balance += property.values.mortgage;
    },

    // Unmortgage property
    unmortgage: function(property) {

      // Player is not **property** owner
      MonopolyAssert('OwnerError', this !== property.owner, property.name);

      // Player doesn't have enough currency
      MonopolyAssert('LowBalanceError', property.costs.mortgage >= this.balance);

      property.unmortgage();
      this.balance -= property.costs.mortgage;
    },

    // Bankrupt **player** and take all assets
    bankrupt: function(player) {
      var prop, group;

      // Mortgage all properties
      for (var propName in player.properties) {
        prop = player.properties[propName];
        group = prop.group;

        // Sell any improvements first
        while (prop.anyImproved) {
          for (var i = 0, l = group.length; i < l; i++) {
            if (group[i].isImproved) {
              player.unimprove(group[i]);
            }
          }
        }

        player.mortgage(prop);
      }

      // Take **player** assets
      player.transfer(this, 'properties');
      player.transfer(this, 'assets');
      player.transfer(this, 'balance');
    },

    // Is player currently bankrupt?
    get isBankrupt() {

      // Player doesn't own any properties
      if (_.keys(this.properties).length === 0) {

        // Player doesn't have any currency
        if (this.balance >= 0) {

          // Player is bankrupt
          return true;
        }
      }

      // Player is not bankrupt
      return false;
    },

    // Player's total value
    get value() {

      // Start with current balance
      var total = this.balance;

      // Add total value of each owned property
      for (var propName in this.properties) {
        total += this.properties[propName].value;
      }

      return total;
    },

    // Get any properties
    get properties() {
      return M.Property.belongsTo(this);
    }
  };

  // Create the default "bank" player
  M.Bank = new Player({
    name: 'bank',
    token: 'bank',
    balance: M.bankBalance
  });

  return Player;

};
