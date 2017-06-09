import { throwError } from './error';

import {
  negativeAmount,
  bankHasFunds
} from './common';
import {
  sufficientBalance
} from './players';

import {
  BUY_PROPERTY,
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY
} from '../actions';

/**
 * Validates a property does not have an owner
 * @param {String} property.owner - Property owner id
 * @throws {MonopolyError}
 */
export const propertyUnowned = ({ property }) => {
  property.owner !== 'bank' &&
    throwError(`${property.name} must be unowned`);
};

/**
 * Validates a property owner is accurate
 * @param {String} player.id - Player id
 * @param {String} property.owner - Property owner id
 * @throws {MonopolyError}
 */
export const propertyOwnedBy = ({ player, property }) => {
  property.owner !== player.id &&
    throwError(`You do not own ${property.name}`);
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
 * @param {String} player.id - Player id
 * @param {String} property.name - Property name
 * @param {[Object]} group - Array of properties in the group
 * @throws {MonopolyError}
 */
export const propertyIsMonopoly = ({ player, property, group }) => {
  group.every((pr) => pr.owner === player.id) ||
    throwError(`${property.name} is not a monopoly`);
};

/**
 * Validates any property in a group is not mortgaged
  * @param {[Object]} group - Array of properties in the group
 * @param {Boolean} property.mortgaged - Property mortgage status
 * @throws {MonopolyError}
 */
export const propertyIsMortgaged = ({ group }) => {
  const property = group.find((pr) => pr.mortgaged);
  property && throwError(`${property.name} is mortgaged`);
};

/**
 * Validates a property has no improvements
 * @param {Number} property.buildings - Property improvements
 * @throws {MonopolyError}
 */
export const notImproved = ({ property }) => {
  property.buildings === 0 &&
    throwError(`${property.name} is not improved`);
};

/**
 * Validates a property is not fully improved
 * @param {Number} property.buildings - Property improvements
 * @throws {MonopolyError}
 */
export const notFullyImproved = ({ property }) => {
  property.buildings === 5 &&
    throwError(`${property.name} is fully improved`);
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

// Rules for properties
export default {
  [BUY_PROPERTY]: [
    negativeAmount,
    propertyUnowned,
    sufficientBalance
  ],
  [IMPROVE_PROPERTY]: [
    propertyOwnedBy,
    notRailroadOrUtility,
    propertyIsMonopoly,
    propertyIsMortgaged,
    notFullyImproved,
    mustImproveEvenly,
    enoughHousesOrHotels,
    sufficientBalance
  ],
  [UNIMPROVE_PROPERTY]: [
    propertyOwnedBy,
    notRailroadOrUtility,
    notImproved,
    mustUnimproveEvenly,
    enoughHousesOrHotels,
    bankHasFunds
  ]
};
