var _ = require('./helpers');

// The Asset Class
// ==================

class MonopolyAsset {

  // Constructor
  constructor(game, {
    name = '',
    type = '',
    description = '',
    value = 0,
    played = 0
  }) {

    // Set internal attributes
    this._id = _.dasherize(name);
    this._game = game;

    // Make sure ID is unique
    let uniq = 1;
    while (game.assets.find((a) => a._id === this._id)) {
      this._id = _.dasherize(name + (uniq++));
    }

    // Set remaining attributes
    _.extend(this, { name, type, description, value, played });
  }

  // toJSON
  toJSON() {
    let { _id, name, type, description, value, played } = this;
    return { _id, name, type, description, value, played };
  }
};

module.exports = MonopolyAsset;
