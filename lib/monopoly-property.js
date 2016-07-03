var _ = require('./helpers');

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

class MonopolyProperty {

  constructor(game, {
    name = '',
    group = '',
    buildings = 0,
    isMortgaged = false,
    price = 0,
    cost = 0,
    rent = [],
  }) {

    // Set internal attributes
    this._id = _.dasherize(name);
    this._group = group;
    this._rent = rent;
    this._game = game;

    // Set remaining attributes
    _.extend(this, { name, buildings, isMortgaged, price, cost });
  }

  // All properties within this property's group
  get group() {
    return this._game.properties.filter((p) => p._group == this._group);
  }

  // Is property improved?
  get isImproved() {
    return this.buildings > 0;
  }

  // Is property fully improved?
  get isFullyImproved() {
    return this.buildings === 5;
  }

  // Is property a monopoly?
  get isMonopoly() {
    return this.group.every((p) => p.owner === this.owner);
  }

  get mortgage() {
    return Math.round(this.price * this._game.mortgageRate);
  }

  get interest() {
    return Math.round(this.mortgage * this._game.interestRate);
  }

  get improvementValue() {
    return Math.round(this.cost * this._game.buildingRate);
  }

  // Property's total value
  get value() {
    return this.mortgage + (this.buildings * this.improvementValue);
  }

  // Property's rent
  get rent() {

    // Edge case for railroad and utilites
    if (this._group === 'railroad' || this._group === 'utility') {

      // Get amount of properties owned
      var owned = this.group.filter((p) => p.owner == this.owner).length;

      // Rent is based on the amount of properties owned
      return this._rent[owned - 1];
    }

    // Monopoly doubles unimproved rent
    if (this.isMonopoly && this.buildings === 0) {
      return this._rent[0] * 2;
    }

    // Return rent amount
    return this._rent[this.buildings];
  }

  toJSON() {
    let { _id, name, buildings, isMortgaged, price, cost } = this;

    let rent = this._rent;
    let group = this._group;
    let owner = this.owner;
    owner = owner ? owner._id : '';

    return { _id, name, group, buildings, isMortgaged, price, cost, rent, owner };
  }
};

module.exports = MonopolyProperty;
