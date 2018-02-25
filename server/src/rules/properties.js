/**
 * Validates a property has an owner
 * @param {String} property.owner - Property owner token
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const propertyIsOwned = ({ property }, error) => {
  if (property.owner === 'bank') {
    throw error('property.unowned');
  }
};

/**
 * Validates a property does not have an owner
 * @param {String} property.owner - Property owner token
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.player - Player selector
 * @throws {MonopolyError}
 */
export const propertyNotOwned = ({ property }, error, select) => {
  if (property.owner !== 'bank') {
    throw error('property.owned', {
      owner: select.player(property.owner)
    });
  }
};

/**
 * Validates a property owner is accurate
 * @param {String} player.token - Player token
 * @param {String} property.owner - Property owner token
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const propertyOwnedBy = ({ player, property }, error) => {
  if (property.owner !== player.token) {
    throw error('property.not-own');
  }
};

/**
 * Validates multiple properties owners are accurate
 * @param {String} player.token - Player token
 * @param {String} other.token - Another player's token
 * @param {[Object]} properties - Array of properties to validate
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.player - Player selector
 * @throws {MonopolyError}
 */
export const propertiesOwnedBy = ({ player, other, properties }, error, select) => {
  let property = properties.find((pr) => (
    pr.owner !== player.token &&
      (!other || pr.owner !== other.token)
  ));

  if (property) {
    throw error(
      property.owner !== 'bank' ? 'property.owned' : 'property.unowned',
      { property, owner: select.player(property.owner) }
    );
  }
};

/**
 * Validates a property isn't a railroad or utilty
 * @param {String} property.group - Property group
 * @param {[Object]} [properties] - Properties to validate
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const notRailroadOrUtility = ({ property, properties }, error) => {
  let railroadOrUtility = (pr) => pr.group === 'railroad' || pr.group === 'utility';

  if (property && railroadOrUtility(property)) {
    throw error('property.cannot-improve');
  } else if (properties && properties.some(railroadOrUtility)) {
    throw error('property.cannot-improve', { property: properties[0] });
  }
};

/**
 * Validates a property is part of a monopoly
 * @param {String} property.monopoly - Property monopoly statu
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const propertyIsMonopoly = ({ property }, error) => {
  if (!property.monopoly) {
    throw error('property.no-monopoly');
  }
};

/**
 * Validates a property is mortgaged
 * @param {Boolean} property.mortgaged - Property mortgage status
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const propertyIsMortgaged = ({ property }, error) => {
  if (!property.mortgaged) {
    throw error('property.unmortgaged');
  }
};

/**
 * Validates multiple properties are mortgaged
 * @param {[Object]} properties - Properties to validate
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const propertiesAreMortgaged = ({ properties }, error) => {
  if (properties.find((pr) => !pr.mortgaged)) {
    throw error('property.multi-unmortgaged');
  }
};

/**
 * Validates a property is not mortgaged
 * @param {String} property.mortgaged - Property group
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const propertyNotMortgaged = ({ property }, error) => {
  if (property.mortgaged) {
    throw error('property.mortgaged');
  }
};

/**
 * Validates any properties in the group are not mortgaged
 * @param {String} property.group - Property group
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.group - Property group selector
 * @throws {MonopolyError}
 */
export const propertiesNotMortgaged = ({ property }, error, select) => {
  let mortgaged = select.group(property.group).find((p) => p.mortgaged);

  if (mortgaged) {
    throw error('property.mortgaged', { property: mortgaged });
  }
};

/**
 * Validates a property has improvements
 * @param {Number} property.buildings - Property improvements
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const propertyIsImproved = ({ property }, error) => {
  if (property.buildings === 0) {
    throw error('property.unimproved');
  }
};

/**
 * Validates multiple properties have some improvements
 * @param {[Object]} properties - Properties to validatae
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const propertiesAreImproved = ({ properties }, error) => {
  if (properties.every((pr) => !pr.buildings)) {
    throw error('property.multi-unimproved');
  }
};

/**
 * Validates a property has no improvements
 * @param {Number} property.buildings - Property improvements
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const propertyNotImproved = ({ property }, error) => {
  if (property.buildings > 0) {
    throw error('property.improved');
  }
};

/**
 * Validates multiple properties have no improvements
 * @param {[Object]} properties - Properties to validate
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const propertiesNotImproved = ({ properties }, error) => {
  if (!properties.every((pr) => !pr.buildings)) {
    throw error('property.multi-unimproved');
  }
};

/**
 * Validates a property is not fully improved
 * @param {Number} property.buildings - Property improvements
 * @param {Function} error - Creates a monopoly error
 * @throws {MonopolyError}
 */
export const propertyNotFullyImproved = ({ property }, error) => {
  if (property.buildings === 5) {
    throw error('property.fully-improved');
  }
};

/**
 * Validates a property group has no improvements
 * @param {String} property.group - Property group
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.group - Property group selector
 * @throws {MonopolyError}
 */
export const monopolyNotImproved = ({ property }, error, select) => {
  let group = select.group(property.group);
  let improved = group.find((pr) => pr.buildings > 0);

  if (improved) {
    throw error('property.improved', { property: improved });
  }
};

/**
 * Validates a property is being improved evenly
 * @param {Number} property.buildings - Property improvements
 * @param {String} property.group - Property group
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.group - Property group selector
 * @throws {MonopolyError}
 */
export const mustImproveEvenly = ({ property }, error, select) => {
  let lowest = select.group(property.group).reduce(
    (low, pr) => Math.min(low, pr.buildings),
    property.buildings
  );

  if (property.buildings > lowest) {
    throw error('property.build-evenly');
  }
};

/**
 * Validates a property is being unimproved evenly
 * @param {Number} property.buildings - Property improvements
 * @param {String} property.group - Property group
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.group - Property group selector
 * @throws {MonopolyError}
 */
export const mustUnimproveEvenly = ({ property }, error, select) => {
  let highest = select.group(property.group).reduce(
    (high, pr) => Math.max(high, pr.buildings),
    property.buildings
  );

  if (property.buildings < highest) {
    throw error('property.build-evenly');
  }
};

/**
 * Validates that there are enough houses or hotels
 * @param {Number} houses - Houses needed
 * @param {Number} hotels - Hotels needed
 * @param {Function} error - Creates a monopoly error
 * @param {Function} select.state - State selector
 * @throws {MonopolyError}
 */
export const enoughHousesOrHotels = ({ houses, hotels }, error, select) => {
  if (select.state('houses') < houses) {
    throw error('property.no-houses');
  } else if (select.state('hotels') < hotels) {
    throw error('property.no-hotels');
  }
};
