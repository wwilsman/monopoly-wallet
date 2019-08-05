import { withProperty, withGroup } from '../utils';
import { error, withError } from '../../error';

// checks if a property has a specific owner
export function isOwnedBy(id, owner) {
  return withError(({ properties }) => {
    if (properties[id].owner === 'bank') {
      throw error('property.unowned', { property: id });
    } else if (owner && properties[id].owner !== owner) {
      throw error('property.not-own', { property: id });
    }
  });
}

// checks if a property is not owned by the player
export function isNotOwn(id, owner) {
  return withError(({ properties }) => {
    if (properties[id].owner === owner) {
      throw error('property.own-self', { property: id });
    }
  });
}

// checks if a property is owned by the bank
export function isNotOwned(id) {
  return withError(({ properties }) => {
    let { owner } = properties[id];

    if (owner !== 'bank') {
      throw error('property.owned', { property: id, owner });
    }
  });
}

// checks if a property is neither a railroad nor utility for improvement
export function isNotRailroadOrUtility(id) {
  return withError(({ properties }) => {
    if (properties[id].group === 'railroad' || properties[id].group === 'utility') {
      throw error('property.cannot-improve', { property: id });
    }
  });
}

// checks if a property is part of a monopoly
export function isMonopoly(id) {
  return withError(({ properties }) => {
    if (!properties[id].monopoly) {
      throw error('property.no-monopoly', { property: id });
    }
  });
}

// checks if a property is mortgaged
export function isMortgaged(id) {
  return withError(({ properties }) => {
    if (!properties[id].mortgaged) {
      throw error('property.unmortgaged', { property: id });
    }
  });
}

// checks if a property is not mortgaged
export function isNotMortgaged(id) {
  return withError(({ properties }) => {
    if (properties[id].mortgaged) {
      throw error('property.mortgaged', { property: id });
    }
  });
}

// checks if a property has any improvements
export function isImproved(id) {
  return withError(({ properties }) => {
    if (properties[id].buildings === 0) {
      throw error('property.unimproved', { property: id });
    }
  });
}

// checks if a property has no improvements
export function isNotImproved(id) {
  return withError(({ properties }) => {
    if (properties[id].buildings > 0) {
      throw error('property.improved', { property: id });
    }
  });
}

// checks if a property is not fully improved
export function isNotFullyImproved(id) {
  return withError(({ properties }) => {
    if (properties[id].buildings === 5) {
      throw error('property.fully-improved', { property: id });
    }
  });
}

// checks if a property is being improved evenly based on it's group
export function isImprovedEvenly(id) {
  return withProperty(id, ({ group, buildings }) => (
    withGroup(group, g => withError(() => {
      let lowest = g.reduce((low, p) => Math.min(low, p.buildings), buildings);

      if (buildings > lowest) {
        throw error('property.build-evenly', { property: id });
      }
    }))
  ));
}

// checks if a property is being unimproved evenly based on it's group
export function isUnimprovedEvenly(id) {
  return withProperty(id, ({ group, buildings }) => (
    withGroup(group, g => withError(() => {
      let highest = g.reduce((high, p) => Math.max(high, p.buildings), buildings);

      if (buildings < highest) {
        throw error('property.build-evenly', { property: id });
      }
    }))
  ));
}

// checks if there are enough houses or hotels available
export function isEnoughBuildings(houses, hotels = 0) {
  return withError(state => {
    if (state.houses < houses) {
      throw error('property.no-houses');
    } else if (state.hotels < hotels) {
      throw error('property.no-hotels');
    }
  });
}
