import { calc } from '../helpers';

export const BUY_PROPERTY = 'BUY_PROPERTY';
export const IMPROVE_PROPERTY = 'IMPROVE_PROPERTY';
export const UNIMPROVE_PROPERTY = 'UNIMPROVE_PROPERTY';
export const MORTGAGE_PROPERTY = 'MORTGAGE_PROPERTY';
export const UNMORTGAGE_PROPERTY = 'UNMORTGAGE_PROPERTY';
export const PAY_RENT = 'PAY_RENT';

/**
 * Action creator for buying property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @param {Number} [amount] - Optional amount defaults to property price
 * @returns {Object} Redux action
 */
export const buyProperty = (playerToken, propertyId, amount) => ({
  type: BUY_PROPERTY,
  player: { token: playerToken },
  property: { id: propertyId },
  amount: typeof amount !== 'undefined' ? amount :
    calc(({ property }) => property.price),
  notice: { id: 'property.bought' }
});

/**
 * Action creator for improving a property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @returns {Object} Redux action
 */
export const improveProperty = (playerToken, propertyId) => ({
  type: IMPROVE_PROPERTY,
  player: { token: playerToken },
  property: { id: propertyId },
  houses: calc(({ property }) => property.buildings === 4 ? -4 : 1),
  hotels: calc(({ property }) => property.buildings === 4 ? 1 : 0),
  amount: calc(({ property }) => property.cost),
  notice: { id: 'property.improved' }
});

/**
 * Action creator for unimproving a property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @returns {Object} Redux action
 */
export const unimproveProperty = (playerToken, propertyId) => ({
  type: UNIMPROVE_PROPERTY,
  player: { token: playerToken },
  property: { id: propertyId },
  houses: calc(({ property }) => property.buildings === 5 ? 4 : -1),
  hotels: calc(({ property }) => property.buildings === 5 ? -1 : 0),
  amount: calc(({ property, config }) => property.cost * config.buildingRate),
  notice: { id: 'property.unimproved' }
});

/**
 * Action creator for mortgaging a property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @returns {Object} Redux action
 */
export const mortgageProperty = (playerToken, propertyId) => ({
  type: MORTGAGE_PROPERTY,
  player: { token: playerToken },
  property: { id: propertyId },
  amount: calc(({ property, config }) => property.price * config.mortgageRate),
  notice: { id: 'property.mortgaged' }
});

/**
 * Action creator for unmortgaging a property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @returns {Object} Redux action
 */
export const unmortgageProperty = (playerToken, propertyId) => ({
  type: UNMORTGAGE_PROPERTY,
  player: { token: playerToken },
  property: { id: propertyId },
  amount: calc(({ property, config }) => {
    const principle = property.price * config.mortgageRate;
    return principle + (principle * config.interestRate);
  }),
  notice: { id: 'property.unmortgaged' }
});

/**
 * Action creator for paying rent on a property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @param {Number} [dice=2] - Dice roll amount
 * @returns {Object} Redux action
 */
export const payRent = (playerToken, propertyId, dice = 2) => ({
  type: PAY_RENT,
  player: { token: playerToken },
  property: { id: propertyId },
  other: calc(({ property }) => ({ token: property.owner })),
  amount: calc(({ property, group }) => {
    const owned = group.filter((pr) => pr.owner === property.owner);

    switch (property.group) {
      case 'railroad':
        return property.rent[owned.length - 1];
      case 'utility':
        return property.rent[owned.length - 1] * dice;
      default:
        return (owned.length === group.length && property.buildings === 0) ?
          property.rent[0] * 2 : property.rent[property.buildings];
    }
  }),
  notice: { id: 'property.paid-rent' }
});
