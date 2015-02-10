Player = (function () {

  // The Player Class
  // ==================

  function Player(props) {

    // Player cannot be created without **token**
    if (!(props && props.token)) {
      throw Error('Player cannot be created without "token"');
    }

    // Set properties
    _.extend(this, props);

    // New players start with these defaults
    this.assets = this.assets || {};
    this.balance = this.balance || 1500;

    // Add this Player to the collection
    Player.collection[this.token] = this;
  }


  // Static Properties
  // -----------------

  // Collection of all players indexed by token
  Player.collection = {};


  // Static Methods
  // -----------------

  // Get the player
  Player.get = function(token) {
    var player = Player.collection[token];

    // Show error if player doesn't exist in the collection
    if (!player) {
      throw Error('Unknown Player "' + token + '"');
    }

    return player;
  };
  

  // Player Methods
  // ----------------

  Player.prototype = {

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
          player.assets[asset] = (player.assets[asset] || 0) + this.assets[asset];
          delete this.assets[asset];
        }

        break;

      // Transfer properties
      case 'properties':

        for (var propGroup in this.properties) {
          for (var propName in this.properties[propGroup]) {
            this.properties[propGroup][propName].transfer(player);
          }
        }

        break;

      // Not a bulk transfer
      default:

        // Transfer an amount of currency
        if (typeof what === 'number') {

          // Player doesn't have enough currency
          if (what >= this.balance) {
            throw Error('Not enough');
          }

          player.balance += what;
          this.balance -= what;

        // Transfer an asset
        } else if (typeof what === 'string') {

          // Player doesn't own asset
          if (!this.assets[what]) {
            throw Error('You don\'t have any');
          }

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

          // Property has improvements
          if (what.isImproved) {
            throw Error('Cannot transfer improved property');
          }

          what.transfer(player);
        }

        break;
      }
    },

    // Improve property
    imporove: function(property) {

      // Player is not **property** owner
      if (this !== property.owner) {
        throw Error('You are not the property owner');
      }

      // Player doesn not have enough currency
      if (property.buildingCost >= this.balance) {
        throw Error('You do not have enough money');
      }

      property.improve();
      this.balance -= property.buildingCost;
    },

    // Unimprove property
    unimprove: function(property) {

      // Player is not **property** owner
      if (this !== property.owner) {
        throw Error('You are not the property owner');
      }

      property.unimprove();
      this.balance += property.buildingValue;
    },

    // Mortgage property
    mortgage: function(property) {

      // Player is not **property** owner
      if (this !== property.owner) {
        throw Error('You are not the property owner');
      }

      property.mortgage()
      this.balance += property.mortgageValue;
    },

    // Unmortgage property
    unmortgage: function(property) {

      // Player is not **property** owner
      if (this !== property.owner) {
        throw Error('You are not the property owner');
      }

      // Player doesn't have enough currency
      if (property.cost >= this.balance) {
        throw Error('You do not have enough currency');
      }

      property.unmortgage()
      this.balance -= property.cost;
    },

    // Bankrupt player and give all assets to **beneficiary**
    bankrupt: function(beneficiary) {

      // Mortgage all properties
      for (var propGroup in this.properties) {
        for (var propName in this.properties[propGroup]) {
          this.properties[propGroup][propName].mortgage();
        }
      }

      // Give **beneficiary** all properties
      this.transfer(beneficiary, 'properties');

      // Give **beneficiary** any assets
      this.transfer(beneficiary, 'assets');

      // Give **beneficiary** all currency
      this.transfer(beneficiary, 'balance');
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
      for (var propGroup in this.properties) {
        for (var propName in this.properties[propGroup]) {
          total += this.properties[propGroup][propName].value;
        }
      }

      return total;
    },

    // Get any properties
    get properties() {
      return Property.belongsTo(this);
    }
  };

  return Player;

})();
