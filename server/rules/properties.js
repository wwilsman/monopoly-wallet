import { throwError } from './error';
import { negativeAmount } from './common';
import { sufficientBalance } from './players';
import {
  BUY_PROPERTY
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

// Rules for properties
export default {
  [BUY_PROPERTY]: [
    negativeAmount,
    propertyUnowned,
    sufficientBalance
  ]
};
