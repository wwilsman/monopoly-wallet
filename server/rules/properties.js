import { throwError } from './error';
import { sufficientBalance } from './players';
import {
  BUY_PROPERTY
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

// Rules for properties
export default {
  [BUY_PROPERTY]: [
    propertyUnowned,
    sufficientBalance
  ]
};
