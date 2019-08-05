import {
  pipe,
  reduce,
  withConfig,
  withProperty,
  withGroup,
} from './utils';
import {
  transferAmount,
  transferProperty,
  notice
} from './common';
import {
  isBalanceSufficient,
  isNotNegative,
  isPlayerFound,
  isOwnedBy,
  isNotOwn,
  isNotOwned,
  isNotRailroadOrUtility,
  isMonopoly,
  isMortgaged,
  isNotMortgaged,
  isImproved,
  isNotImproved,
  isNotFullyImproved,
  isImprovedEvenly,
  isUnimprovedEvenly,
  isEnoughBuildings
} from './rules';

// purchases a property from the bank
export function buy(token, property, amount) {
  return pipe(
    isPlayerFound(token),
    isNotNegative(amount),
    isNotOwned(property),
    withProperty(property, ({ price }) => {
      amount = amount ?? price;

      return pipe(
        isBalanceSufficient(token, amount),
        transferProperty(property, token),
        transferAmount(token, 'bank', amount),
        notice('property.bought', { player: token, property, amount })
      );
    })
  );
}

// transfers a property from one player to another
export function transfer(token, property, owner) {
  return pipe(
    isPlayerFound(token),
    isPlayerFound(owner),
    isOwnedBy(property, token),
    isNotOwn(property, owner),
    isNotMortgaged(property),
    withProperty(property, ({ group }) => pipe(
      withGroup(group, g => pipe(g.map(({ id }) => isNotImproved(id)))),
      transferProperty(property, owner),
      notice('property.transfer', { player: owner, property })
    ))
  );
}

// improves a property, adjusting houses/hotels, and transfers the building cost
// from the player to the bank
export function improve(token, property) {
  return pipe(
    isPlayerFound(token),
    isOwnedBy(property, token),
    isNotRailroadOrUtility(property),
    isNotMortgaged(property),
    isMonopoly(property),
    isNotFullyImproved(property),
    isImprovedEvenly(property),
    withProperty(property, ({ id, buildings, cost }) => pipe(
      isBalanceSufficient(token, cost),
      buildings === 4 ? isEnoughBuildings(0, 1) : isEnoughBuildings(1),
      reduce('houses', h => buildings === 4 ? h + 4 : h - 1),
      reduce('hotels', h => buildings === 4 ? h - 1 : h),
      reduce(`properties.${id}.buildings`, b => b + 1),
      transferAmount(token, 'bank', cost),
      notice('property.improved', { player: token, property })
    ))
  );
}

// unimproves a property, adjusting houses/hotels, and transfers the building
// cost minus the building rate from the bank to the player
export function unimprove(token, property) {
  return pipe(
    isPlayerFound(token),
    isOwnedBy(property, token),
    isNotRailroadOrUtility(property),
    isImproved(property),
    isUnimprovedEvenly(property),
    withConfig(({ buildingRate }) => (
      withProperty(property, ({ id, buildings, cost }) => pipe(
        isBalanceSufficient('bank', cost * buildingRate),
        buildings === 5 && isEnoughBuildings(4),
        reduce('houses', h => buildings === 5 ? h - 4 : h + 1),
        reduce('hotels', h => buildings === 5 ? h + 1 : h),
        reduce(`properties.${id}.buildings`, b => b - 1),
        transferAmount('bank', token,  cost * buildingRate),
        notice('property.unimproved', { player: token, property })
      ))
    ))
  );
}

// mortgages a property, transferring the mortgage price of the property from
// the bank to the player
export function mortgage(token, property) {
  return pipe(
    isPlayerFound(token),
    isOwnedBy(property, token),
    isNotMortgaged(property),
    withConfig(({ mortgageRate }) => (
      withProperty(property, ({ id, group, price }) => pipe(
        isBalanceSufficient('bank', price * mortgageRate),
        withGroup(group, g => pipe(g.map(({ id }) => isNotImproved(id)))),
        transferAmount('bank', token, price * mortgageRate),
        reduce(`properties.${id}.mortgaged`, () => true),
        notice('property.mortgaged', { player: token, property })
      ))
    ))
  );
}

// unmortgages a property, transferring the mortgage price plus interest from
// the player to the bank
export function unmortgage(token, property) {
  return pipe(
    isPlayerFound(token),
    isOwnedBy(property, token),
    isMortgaged(property),
    withConfig(({ mortgageRate, interestRate }) => (
      withProperty(property, ({ id, price }) => {
        let principle = price * mortgageRate;
        let interest = principle * interestRate;

        return pipe(
          isBalanceSufficient(token, principle + interest),
          transferAmount(token, 'bank', principle + interest),
          reduce(`properties.${id}.mortgaged`, () => false),
          notice('property.unmortgaged', { player: token, property })
        );
      })
    ))
  );
}

// pays the property owner rent calculated by the monopoly status, building
// count, and somtimes property count for railroads or dice roll for utilities
export function rent(token, property, dice = 2) {
  return pipe(
    isPlayerFound(token),
    isNotOwn(property, token),
    isOwnedBy(property),
    isNotMortgaged(property),
    withProperty(property, property => (
      withGroup(property.group, g => {
        let owned = g.filter((p) => p.owner === property.owner);
        let rent = property.rent[property.buildings];

        if (property.group === 'railroad') {
          rent = property.rent[owned.length - 1];
        } else if (property.group === 'utility') {
          rent = property.rent[owned.length - 1] * dice;
        } else if (property.monopoly && property.buildings === 0) {
          rent = property.rent[0] * 2;
        }

        return pipe(
          isBalanceSufficient(token, rent),
          transferAmount(token, property.owner, rent),
          notice('property.paid-rent', {
            player: token,
            other: property.owner,
            property: property.id
          })
        );
      })
    ))
  );
}
