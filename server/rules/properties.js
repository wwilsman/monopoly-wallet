/**
 * Validates a property has an owner
 * @param {String} property.owner - Property owner token
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertyIsOwned = ({ property }, throwError) => {
  property.owner === 'bank' && throwError('property.unowned');
};

/**
 * Validates a property does not have an owner
 * @param {Object} state - Current game state
 * @param {String} property.owner - Property owner token
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertyNotOwned = ({ state, property }, throwError) => {
  const owner = state.players[property.owner];
  owner && throwError('property.owned', { owner });
};

/**
 * Validates a property owner is accurate
 * @param {String} player.token - Player token
 * @param {String} property.owner - Property owner token
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertyOwnedBy = ({ player, property }, throwError) => {
  property.owner !== player.token && throwError('property.not-own');
};

/**
 * Validates multiple properties owners are accurate
 * @param {String} player.token - Player token
 * @param {String} other.token - Another player's token
 * @param {[Object]} properties - Array of properties to validate
 * @param {String} property.owner - Property owner token
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertiesOwnedBy = ({ player, other, properties }, throwError) => {
  const property = properties.find((pr) => (
    pr.owner !== player.token && pr.owner !== other.token
  ));

  if (property) {
    throwError(
      property.owner !== 'bank' ?
        'property.owned' :
        'property.unowned'
    );
  }
};

/**
 * Validates a property isn't a railroad or utilty
 * @param {String} property.group - Property group
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const notRailroadOrUtility = ({ property }, throwError) => {
  (property.group === 'railroad' || property.group === 'utility') &&
    throwError('property.cannot-improve');
};

/**
 * Validates a property is part of a monopoly
 * @param {String} player.token - Player token
 * @param {[Object]} group - Array of properties in the group
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertyIsMonopoly = ({ player, group }, throwError) => {
  group.find((pr) => pr.owner !== player.token) &&
    throwError('property.no-monopoly');
};

/**
 * Validates a property is mortgaged
 * @param {Boolean} property.mortgaged - Property mortgage status
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertyIsMortgaged = ({ property }, throwError) => {
  !property.mortgaged && throwError('property.unmortgaged');
};

/**
 * Validates multiple properties are mortgaged
 * @param {[Object]} properties - Properties to validate
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertiesAreMortgaged = ({ properties }, throwError) => {
  properties.find((pr) => !pr.mortgaged) &&
    throwError('property.multi-unmortgaged');
};

/**
 * Validates a property or any in the group is not mortgaged
 * @param {Boolean} property.mortgaged - Property mortgage status
 * @param {[Object]} group - Array of properties in the group
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertyNotMortgaged = ({ property, group }, throwError) => {
  property = (property.mortgaged || group.find((pr) => pr.mortgaged));
  property && throwError('property.mortgaged', { property });
};

/**
 * Validates a property has improvements
 * @param {Number} property.buildings - Property improvements
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertyIsImproved = ({ property }, throwError) => {
  property.buildings === 0 && throwError('property.unimproved');
};

/**
 * Validates a property has no improvements
 * @param {Number} property.buildings - Property improvements
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertyNotImproved = ({ property }, throwError) => {
  property.buildings > 0 && throwError('property.improved');
};

/**
 * Validates multiple properties have no improvements
 * @param {[Object]} properties - Properties to validate
 * @param {Number} property.buildings - Property improvements
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertiesNotImproved = ({ properties }, throwError) => {
  properties.find((pr) => pr.buildings > 0) &&
    throwError('property.multi-unimproved');
};

/**
 * Validates a property is not fully improved
 * @param {Number} property.buildings - Property improvements
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const propertyNotFullyImproved = ({ property }, throwError) => {
  property.buildings === 5 && throwError('property.fully-improved');
};

/**
 * Validates a property group has no improvements
 * @param {[Object]} group - Array of properties in the group
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const monopolyNotImproved = ({ group }, throwError) => {
  const property = group.find((pr) => pr.buildings > 0);
  property && throwError('property.improved', { property });
};

/**
 * Validates a property is being improved evenly
 * @param {Number} property.buildings - Property improvements
 * @param {[Object]} group - Array of properties in the group
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const mustImproveEvenly = ({ property, group }, throwError) => {
  const lowest = group.reduce(
    (low, pr) => Math.min(low, pr.buildings),
    property.buildings
  );

  property.buildings > lowest &&
    throwError('property.build-evenly');
};

/**
 * Validates a property is being unimproved evenly
 * @param {Number} property.buildings - Property improvements
 * @param {[Object]} group - Array of properties in the group
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const mustUnimproveEvenly = ({ property, group }, throwError) => {
  const highest = group.reduce(
    (high, pr) => Math.max(high, pr.buildings),
    property.buildings
  );

  property.buildings < highest &&
    throwError('property.build-evenly');
};

/**
 * Validates that there are enough houses or hotels
 * @param {Object} state - Current game state
 * @param {Number} houses - Houses needed
 * @param {Number} hotels - Hotels needed
 * @param {Function} throwError - Throws a monopoly error
 * @throws {MonopolyError}
 */
export const enoughHousesOrHotels = ({ state, houses, hotels }, throwError) => {
  if (state.houses < houses) throwError('property.houses');
  else if (state.hotels < hotels) throwError('property.hotels');
};
