var _ = require('../helpers');
var MonopolyProperty = require('./property');
var MonopolyAsset = require('./asset');

// The Player Class
// ==================

class MonopolyPlayer {

  // Constructor
  constructor(game, {
    name = '',
    token = '',
    balance = 0,
  }) {

    // Require a name at the least
    _.assert('PlayerError', 'Player must have a name', !name);

    // Set internal attributes
    this._id = _.dasherize(name);
    this._game = game;

    // Prevent players from being named "bank"
    _.assert('PlayerError', `Player cannot be named "${name}"`, game.bank && this._id === 'bank');

    // Set remaining attributes
    _.extend(this, { name, token, balance });
  }

  // Player's total value
  get value() {
    return this.properties.reduce((t, p) => t + p.value, this.balance);
  }

  // Get any properties
  get properties() {
    return this._game.properties.filter((p) => p.owner === this);
  }

  // Get any assets
  get assets() {
    return this._game.assets.filter((a) => a.owner === this);
  }

  // Is player currently bankrupt?
  get isBankrupt() {
    return this.properties.length === 0 && this.assets.length === 0 && this.balance === 0;
  }

  // Transfer money/properties/assets to another player
  transfer(player, items) {
    items = [].concat(items);

    // Can't transfer to yourself
    if (this === player) {
      return;
    }

    // Error check before transferring
    items = items.map((item) => {

      // Property/Asset
      if (item instanceof MonopolyProperty || item instanceof MonopolyAsset) {

        // Player doesn't own property/asset
        _.assert('OwnerError', `${this.name} doesn\'t own ${item.name}`, item.owner !== this);

        // Property
        if (item instanceof MonopolyProperty) {

          // Properties in group must be unimproved
          _.assert('ImprovementError', `Property in ${item._group} has improvements`,
            item.group.some((p) => p.isImproved));

          // Safe to transfer
          return item;

        // Asset without value
        } else if (item.value === 0) {

          // Safe to transfer
          return item;
        }

        // Transfer the value instead
        item = item.value;
      }

      // Transfering money
      if (typeof item === 'number') {

        // Player must have enough to transfer
        _.assert('BalanceError', 'Insufficient balance', item > this.balance);

        // Safe to transfer
        return item;
      }
    }).filter((i) => !!i);

    // Transfer each item
    items.forEach((item) => {

      // Transfer a property/asset
      if (item instanceof MonopolyProperty || item instanceof MonopolyAsset) {
        item.owner = player;

      // Transfer an amount of money
      } else if (typeof item === 'number') {
        player.balance += item;
        this.balance -= item;
      }
    });
  }

  // Bankrupt **player** and take all money/properties/assets
  bankrupt(player) {

    // Can't bankrupt the bank
    _.assert('PlayerError', 'Cannot bankrupt the bank', player.name === 'bank');

    // Mortgage all properties
    player.properties.filter((p) => !p.isMortgaged).forEach((property) => {

      // Sell improvements first
      while (property.group.some((p) => p.isImproved)) {
        property.group.filter((p) => p.isImproved).sort((p1, p2) => {
          return p2.buildings - p1.buildings;
        }).forEach((p) => player.unimprove(p));
      }

      // Mortgage property
      player.mortgage(property);
    });

    // Transfer everything
    player.transfer(this, [player.balance, ...player.properties, ...player.assets]);
  }

  // Improve property
  improve(property) {

    // Not owned by the player
    _.assert('OwnerError', `${this.name} does not own ${property.name}`, property.owner !== this);

    // Get group name
    let group = property._group;

    // Railroad or Utility
    _.assert('PropertyError', `Cannot improve ${group}`, group === 'railroad' || group === 'utility');

    // Needs to be a monopoly
    _.assert('ImprovementError', `Must own all ${group} properties`, !property.isMonopoly);

    // Already fully improved
    _.assert('ImprovementError', `${property.name} is already fully improved`, property.isFullyImproved);

    // Must build evenly
    _.assert('ImprovementError', 'Must build evenly',
      property.group.find((p) => p.buildings === property.buildings - 1));

    // Do we need a hotel?
    let needsHotel = property.buildings === 4;

    // Not enough hotels
    _.assert('AvailabilityError', 'Not enough hotels', needsHotel && this._game.hotels < 1);

    // Not enough houses
    _.assert('AvailabilityError', 'Not enough houses', !needsHotel && this._game.houses < 1);

    // Pay the bank
    this.transfer(this._game.bank, property.cost);

    // Subtract buildings from game
    this._game.hotels -= needsHotel ?  1 : 0;
    this._game.houses -= needsHotel ? -4 : 1;

    // Add building
    property.buildings += 1;
  }

  // Unimprove property
  unimprove(property) {

    // Not owned by the player
    _.assert('OwnerError', `${this.name} does not own ${property.name}`, property.owner !== this);

    // Railroad or Utility
    _.assert('UnimprovementError', `Cannot unimprove ${property._group}`,
      property._group === 'railroad' || property._group === 'utility');

    // Already fully unimproved
    _.assert('UnimprovementError', `${property.name} has no improvements`, !property.isImproved);

    // Must build evenly
    _.assert('UnimprovementError', 'Must build evenly',
      property.group.find((p) => p.buildings === property.buildings + 1));

    // Needs houses
    let needsHouses = property.isFullyImproved;

    // Not enough houses
    _.assert('AvailabilityError', 'Not enough houses', needsHouses && this._game.houses < 4);

    // Sell the improvement
    this._game.bank.transfer(this, property.improvementValue);

    // Remove building
    property.buildings -= 1;

    // Add hotels/houses to game
    this._game.hotels += needsHouses ?  1 : 0;
    this._game.houses += needsHouses ? -4 : 1;
  }

  // Mortgage property
  mortgage(property) {

    // Not owned by the player
    _.assert('OwnerError', `${this.name} does not own ${property.name}`, property.owner !== this);

    // Property is already mortgaged
    _.assert('MortgageError', `${property.name} is already mortgaged`, property.isMortgaged);

    // Property in group has improvements
    _.assert('MortgageError', `Other ${property._group} properties have improvements`,
      property.group.some((p) => p.isImproved));

    // Get money from bank
    this._game.bank.transfer(this, property.mortgage);

    // Mark property as mortgaged
    property.isMortgaged = true;
  }

  // Unmortgage property
  unmortgage(property) {

    // Not owned by the player
    _.assert('OwnerError', `${this.name} does not own ${property.name}`, property.owner !== this);

    // Property is not mortgaged
    _.assert('UnmortgageError', `${property.name} is not mortgaged`, !property.isMortgaged);

    // Pay the mortgage + interest
    this.transfer(this._game.bank, property.mortgage + property.interest);

    // Mark property as not mortgaged
    property.isMortgaged = false;
  }

  // toJSON
  toJSON() {
    let { _id, name, token, balance } = this;
    let properties = this.properties.map((p) => p._id);
    let assets = this.assets.map((a) => a._id);
    return { _id, name, token, balance, properties, assets };
  }
};

module.exports = MonopolyPlayer;
