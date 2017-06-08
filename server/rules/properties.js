import { getProperties } from '../helpers';
import { throwError } from './error';
import { negativeAmount } from './common';
import { sufficientBalance } from './players';
import {
  BUY_PROPERTY,
  IMPROVE_PROPERTY
} from '../actions';

/**
 * Validates a property does not have an owner
 * @param {String} property.owner - Property owner id
 * @throws {MonopolyError}
 */
export const propertyUnowned = (state, { property }) => {
  property.owner !== 'bank' &&
    throwError(`${property.name} must be unowned`);
};

/**
 * Validates a property owner is accurate
 * @param {String} player.id - Player id
 * @param {String} property.owner - Property owner id
 * @throws {MonopolyError}
 */
export const propertyOwnedBy = (state, { player, property }) => {
  property.owner !== player.id &&
    throwError(`You do not own ${property.name}`);
};

/**
 * Validates a property isn't a railroad or utilty
 * @param {String} property.group - Property group
 * @throws {MonopolyError}
 */
export const notRailroadOrUtility = (state, { property }) => {
  (property.group === 'railroad' || property.group === 'utility') &&
    throwError(`Cannot improve a ${property.group}`);
};

/**
 * Validates a property is part of a monopoly
 * @param {String} player.id - Player id
 * @param {String} property.group - Property group
 * @throws {MonopolyError}
 */
export const propertyIsMonopoly = (state, { player, property }) => {
  getProperties(state, property.group).every((pr) => pr.owner === player.id) ||
    throwError(`${property.name} is not a monopoly`);
};

/**
 * Validates any property in a group is not mortgaged
 * @param {String} property.group - Property group
 * @param {Boolean} property.mortgaged - Property mortgage status
 * @throws {MonopolyError}
 */
export const propertyIsMortgaged = (state, { property }) => {
  const mprop = getProperties(state, property.group).find((pr) => pr.mortgaged);
  mprop && throwError(`${mprop.name} is mortgaged`);
};

/**
 * Validates a property is not fully improved
 * @param {Number} property.buildings - Property improvements
 * @throws {MonopolyError}
 */
export const notFullyImproved = (state, { property }) => {
  property.buildings === 5 &&
    throwError(`${property.name} is fully improved`);
};

/**
 * Validates a property is being improved evenly
 * @param {String} property.group - Property group
 * @param {Number} property.buildings - Property improvements
 * @throws {MonopolyError}
 */
export const mustImproveEvenly = (state, { property }) => {
  const lowest = getProperties(state, property.group).reduce(
    (low, pr) => Math.min(low, pr.buildings),
    property.buildings
  );

  property.buildings > lowest &&
    throwError('Must build evenly');
};

/**
 * Validates that there are enough houses or hotels
 * @param {Number} houses - Houses needed
 * @param {Number} hotels - Hotels needed
 * @throws {MonopolyError}
 */
export const enoughHousesOrHotels = (state, { houses, hotels }) => {
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
  ]
};
