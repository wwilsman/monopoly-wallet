import { getPlayer } from '../helpers';
import { throwError } from './error';

/**
 * Validates a property has an owner
 * @param {String} property.owner - Property owner token
 * @throws {MonopolyError}
 */
export const propertyIsOwned = ({ property }) => {
  property.owner === 'bank' &&
    throwError(`${property.name} is unowned`);
};

/**
 * Validates a property does not have an owner
 * @param {Object} state - Current game state
 * @param {String} property.owner - Property owner token
 * @throws {MonopolyError}
 */
export const propertyNotOwned = ({ state, property }) => {
  const owner = getPlayer(state, property.owner);
  owner && throwError(`${owner.name} owns ${property.name}`);
};

/**
 * Validates a property owner is accurate
 * @param {String} player.token - Player token
 * @param {String} property.owner - Property owner token
 * @throws {MonopolyError}
 */
export const propertyOwnedBy = ({ player, property }) => {
  property.owner !== player.token &&
    throwError(`You do not own ${property.name}`);
};

/**
 * Validates multiple properties owners are accurate
 * @param {Object} state - Current game state
 * @param {String} player.token - Player token
 * @param {String} other.token - Another player's token
 * @param {[Object]} properties - Array of properties to validate
 * @param {String} property.owner - Property owner token
 * @throws {MonopolyError}
 */
export const propertiesOwnedBy = ({ state, player, other, properties }) => {
  const property = properties.find((pr) => (
    pr.owner !== player.token && pr.owner !== other.token
  ));

  if (property) {
    const owner = getPlayer(state, property.owner);
    const ownedBy = owner ? `owned by ${owner.name}` : 'unowned';
    throwError(`${property.name} is ${ownedBy}`);
  }
};

/**
 * Validates a property isn't a railroad or utilty
 * @param {String} property.group - Property group
 * @throws {MonopolyError}
 */
export const notRailroadOrUtility = ({ property }) => {
  (property.group === 'railroad' || property.group === 'utility') &&
    throwError(`Cannot improve a ${property.group}`);
};

/**
 * Validates a property is part of a monopoly
 * @param {String} player.token - Player token
 * @param {String} property.name - Property name
 * @param {[Object]} group - Array of properties in the group
 * @throws {MonopolyError}
 */
export const propertyIsMonopoly = ({ player, property, group }) => {
  group.every((pr) => pr.owner === player.token) ||
    throwError(`${property.name} is not a monopoly`);
};

/**
 * Validates a property is mortgaged
 * @param {Boolean} property.mortgaged - Property mortgage status
 * @throws {MonopolyError}
 */
export const propertyIsMortgaged = ({ property }) => {
  !property.mortgaged && throwError(`${property.name} is not mortgaged`);
};

/**
 * Validates multiple properties are mortgaged
 * @param {[Object]} properties - Properties to validate
 * @throws {MonopolyError}
 */
export const propertiesAreMortgaged = ({ properties }) => {
  properties.find((pr) => !pr.mortgaged) &&
    throwError('You have unmortgaged properties');
};

/**
 * Validates a property or any in the group is not mortgaged
 * @param {Boolean} property.mortgaged - Property mortgage status
 * @param {[Object]} group - Array of properties in the group
 * @throws {MonopolyError}
 */
export const propertyNotMortgaged = ({ property, group }) => {
  property = property.mortgaged ? property : group.find((pr) => pr.mortgaged);
  property && throwError(`${property.name} is mortgaged`);
};

/**
 * Validates a property has improvements
 * @param {Number} property.buildings - Property improvements
 * @throws {MonopolyError}
 */
export const propertyIsImproved = ({ property }) => {
  property.buildings === 0 &&
    throwError(`${property.name} is not improved`);
};

/**
 * Validates a property has no improvements
 * @param {Number} property.buildings - Property improvements
 * @throws {MonopolyError}
 */
export const propertyNotImproved = ({ property }) => {
  property.buildings > 0 &&
    throwError(`${property.name} is improved`);
};

/**
 * Validates multiple properties have no improvements
 * @param {[Object]} properties - Properties to validate
 * @param {Number} property.buildings - Property improvements
 * @throws {MonopolyError}
 */
export const propertiesNotImproved = ({ properties }) => {
  properties.find((pr) => pr.buildings > 0) &&
    throwError('You have unimproved properties');
};

/**
 * Validates a property is not fully improved
 * @param {Number} property.buildings - Property improvements
 * @throws {MonopolyError}
 */
export const propertyNotFullyImproved = ({ property }) => {
  property.buildings === 5 &&
    throwError(`${property.name} is fully improved`);
};

/**
 * Validates a property group has no improvements
 * @param {[Object]} group - Array of properties in the group
 * @throws {MonopolyError}
 */
export const monopolyNotImproved = ({ group }) => {
  const property = group.find((pr) => pr.buildings > 0);
  property && throwError(`${property.name} is improved`);
};

/**
 * Validates a property is being improved evenly
 * @param {Number} property.buildings - Property improvements
 * @param {[Object]} group - Array of properties in the group
 * @throws {MonopolyError}
 */
export const mustImproveEvenly = ({ property, group }) => {
  const lowest = group.reduce(
    (low, pr) => Math.min(low, pr.buildings),
    property.buildings
  );

  property.buildings > lowest &&
    throwError('Must build evenly');
};

/**
 * Validates a property is being unimproved evenly
 * @param {Number} property.buildings - Property improvements
 * @param {[Object]} group - Array of properties in the group
 * @throws {MonopolyError}
 */
export const mustUnimproveEvenly = ({ property, group }) => {
  const highest = group.reduce(
    (high, pr) => Math.max(high, pr.buildings),
    property.buildings
  );

  property.buildings < highest &&
    throwError('Must build evenly');
};

/**
 * Validates that there are enough houses or hotels
 * @param {Object} state - Current game state
 * @param {Number} houses - Houses needed
 * @param {Number} hotels - Hotels needed
 * @throws {MonopolyError}
 */
export const enoughHousesOrHotels = ({ state, houses, hotels }) => {
  if (state.houses < houses) throwError('Not enough houses');
  else if (state.hotels < hotels) throwError('Not enough hotels');
};
