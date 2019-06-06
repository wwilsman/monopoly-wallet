export const BUY_PROPERTY = 'BUY_PROPERTY';
export const IMPROVE_PROPERTY = 'IMPROVE_PROPERTY';
export const UNIMPROVE_PROPERTY = 'UNIMPROVE_PROPERTY';
export const UNIMPROVE_GROUP = 'UNIMPROVE_GROUP';
export const MORTGAGE_PROPERTY = 'MORTGAGE_PROPERTY';
export const UNMORTGAGE_PROPERTY = 'UNMORTGAGE_PROPERTY';
export const MONOPOLIZE_PROPERTY = 'MONOPOLIZE_PROPERTY';
export const PAY_RENT = 'PAY_RENT';

/**
 * Action creator for buying property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @param {Number} [amount] - Optional amount defaults to property price
 * @returns {Object} Redux action
 */
export const buyProperty = (playerToken, propertyId, amount) => {
  return (select) => {
    let property = select.property(propertyId);
    let group = property.group;

    let monopoly = select.group(group).every((pr) => (
      pr.owner === playerToken || pr.id === propertyId
    ));

    return {
      type: BUY_PROPERTY,
      player: { token: playerToken },
      property: { id: propertyId, group, monopoly },
      amount: typeof amount === 'undefined'
        ? select.property(propertyId).price
        : amount,
      notice: { id: 'property.bought' }
    };
  };
};

/**
 * Action creator for improving a property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @returns {Object} Redux action
 */
export const improveProperty = (playerToken, propertyId) => {
  return (select) => {
    let property = select.property(propertyId);

    return {
      type: IMPROVE_PROPERTY,
      player: { token: playerToken },
      property: { id: propertyId },
      houses: property.buildings === 4 ? -4 : 1,
      hotels: property.buildings === 4 ? 1 : 0,
      amount: property.cost,
      notice: { id: 'property.improved' }
    };
  };
};

/**
 * Action creator for unimproving a property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @returns {Object} Redux action
 */
export const unimproveProperty = (playerToken, propertyId) => {
  return (select) => {
    let property = select.property(propertyId);

    return {
      type: UNIMPROVE_PROPERTY,
      player: { token: playerToken },
      property: { id: propertyId },
      houses: property.buildings === 5 ? 4 : -1,
      hotels: property.buildings === 5 ? -1 : 0,
      amount: property.cost * select.config('buildingRate'),
      notice: { id: 'property.unimproved' }
    };
  };
};

/**
 * Action creator for unimproving a group evenly and minimally; _magically_
 * @param {String} playerToken - Player token
 * @param {String} propertyGroup - Property group
 * @returns {Object} Redux action
 */
export const unimproveGroup = (playerToken, propertyGroup) => {
  return (select) => {
    let group = select.group(propertyGroup)
      .sort((a, b) => b.price - a.price || -1);
    let houses = select.state('houses');

    // current houses + available houses
    let available = group.reduce((houses, pr) => (
      houses + (pr.buildings < 5 ? pr.buildings : 0)
    ), houses);

    // one hotel for each property with 5 buildings
    let hotels = group.reduce((hotels, pr) => (
      hotels - (pr.buildings === 5 ? 1 : 0)
    ), 0);

    // when no houses are needed, or there are more than enough,
    // unimprove a single property
    let property = (!hotels || houses > 4) && {
      id: group.reduce((pr, next) => (
        next.buildings >= pr.buildings ? next : pr
      )).id
    };

    // redistribute all buildings, minus one
    // effectively unimprove a single property
    if (property) {
      available = hotels
        ? (4 * group.length) - (hotels + 1)
        : available - houses - 1;
      houses = hotels ? 4 : -1;
      hotels = hotels ? -1 : 0;
    }

    // redistributed buildings
    let properties = group.map(({ id }, i) => ({
      buildings: Math.floor(available / group.length) +
        (available % group.length > i ? 1 : 0),
      id
    }));

    // building differences * cost * selling rate
    let amount = group.reduce((t, pr, i) => (
      t + ((pr.buildings - properties[i].buildings) * pr.cost)
    ), 0) * select.config('buildingRate');

    // we only care about unimproved properties
    properties = properties.filter((pr, i) => (
      group[i].buildings - pr.buildings > 0
    ));

    // `property` here is for the notice message
    return {
      type: UNIMPROVE_GROUP,
      player: { token: playerToken },
      property: property || { group: propertyGroup },
      properties,
      houses,
      hotels,
      amount,
      notice: {
        id: property
          ? 'property.unimproved'
          : 'property.unimproved-group'
      }
    };
  };
};

/**
 * Action creator for mortgaging a property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @returns {Object} Redux action
 */
export const mortgageProperty = (playerToken, propertyId) => {
  return (select) => {
    let property = select.property(propertyId);

    return {
      type: MORTGAGE_PROPERTY,
      player: { token: playerToken },
      property: { id: propertyId },
      amount: property.price * select.config('mortgageRate'),
      notice: { id: 'property.mortgaged' }
    };
  };
};

/**
 * Action creator for unmortgaging a property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @returns {Object} Redux action
 */
export const unmortgageProperty = (playerToken, propertyId) => {
  return (select) => {
    let property = select.property(propertyId);
    let principle = property.price * select.config('mortgageRate');
    let interest = principle * select.config('interestRate');

    return {
      type: UNMORTGAGE_PROPERTY,
      player: { token: playerToken },
      property: { id: propertyId },
      amount: principle + interest,
      notice: { id: 'property.unmortgaged' }
    };
  };
};

/**
 * Action creator for paying rent on a property
 * @param {String} playerToken - Player token
 * @param {String} propertyId - Property ID
 * @param {Number} [dice=2] - Dice roll amount
 * @returns {Object} Redux action
 */
export const payRent = (playerToken, propertyId, dice = 2) => {
  return (select) => {
    let property = select.property(propertyId);
    let group = select.group(property.group);
    let owned = group.filter((p) => p.owner === property.owner);
    let rent = property.rent[property.buildings];

    if (property.group === 'railroad') {
      rent = property.rent[owned.length - 1];
    } else if (property.group === 'utility') {
      rent = property.rent[owned.length - 1] * dice;
    } else if (property.monopoly && property.buildings === 0) {
      rent = property.rent[0] * 2;
    }

    return {
      type: PAY_RENT,
      player: { token: playerToken },
      other: { token: property.owner },
      property: { id: propertyId },
      amount: rent,
      notice: { id: 'property.paid-rent' }
    };
  };
};
