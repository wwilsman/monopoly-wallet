import expect from 'expect';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { improveProperty } from '../../src/actions/properties';

describe('Game: improving properties', () => {
  setupGameForTesting({ state: {
    players: [{
      token: 'top-hat',
      balance: 50
    }],
    properties: [{
      group: 'lightblue',
      monopoly: true,
      owner: 'top-hat'
    }]
  }});

  it('should add a house to the property', function() {
    const property = this.getProperty('oriental-avenue');

    this.dispatch(improveProperty('top-hat', property.id));

    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 50 - property.cost);
    expect(this.state.bank).toBe(this.last.bank + property.cost);
    expect(this.getProperty(property.id)).toHaveProperty('buildings', 1);
    expect(this.state.houses).toBe(this.last.houses - 1);
  });

  it('should not improve an unowned property', function() {
    expect(() => this.dispatch(improveProperty('top-hat', 'mediterranean-avenue')))
      .toThrow(MonopolyError, /not own/i);
    expect(this.getProperty('mediterranean-avenue')).toHaveProperty('buildings', 0);
  });

  it('should not improve with insufficient funds', function() {
    this.dispatch(improveProperty('top-hat', 'oriental-avenue'));

    expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 1);
    expect(() => this.dispatch(improveProperty('top-hat', 'connecticut-avenue')))
      .toThrow(MonopolyError, /insufficient/i);
    expect(this.getProperty('connecticut-avenue')).toHaveProperty('buildings', 0);
  });

  it('should create a notice', function() {
    this.dispatch(improveProperty('top-hat', 'oriental-avenue'));

    expect(this.state.notice.id).toBe('property.improved');
    expect(this.state.notice.message).toMatch('improved');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('property.id', 'oriental-avenue');
  });

  describe('when the property needs a hotel', () => {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'lightblue',
        buildings: 4
      }]
    }});

    it('should remove 4 houses and add a hotel', function() {
      this.dispatch(improveProperty('top-hat', 'oriental-avenue'));

      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 5);
      expect(this.state.houses).toBe(this.last.houses + 4);
      expect(this.state.hotels).toBe(this.last.hotels - 1);
    });
  });

  describe('when a property is a railroad or utility', () => {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'reading-railroad',
        owner: 'top-hat'
      }, {
        id: 'electric-company',
        owner: 'top-hat'
      }]
    }});

    it('should not improve a railroad', function() {
      expect(() => this.dispatch(improveProperty('top-hat', 'reading-railroad')))
        .toThrow(MonopolyError, /improve a railroad/i);
      expect(this.getProperty('reading-railroad')).toHaveProperty('buildings', 0);
    });

    it('should not improve a utility', function() {
      expect(() => this.dispatch(improveProperty('top-hat', 'electric-company')))
        .toThrow(MonopolyError, /improve a utility/i);
      expect(this.getProperty('electric-company')).toHaveProperty('buildings', 0);
    });
  });

  describe('when the player does not own the monopoly', () => {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'lightblue',
        monopoly: false
      }, {
        id: 'connecticut-avenue',
        owner: 'bank'
      }]
    }});

    it('should not improve the property', function() {
      expect(() => this.dispatch(improveProperty('top-hat', 'oriental-avenue')))
        .toThrow(MonopolyError, /monopoly/);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 0);
    });
  });

  describe('when the property is mortgaged', () => {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'oriental-avenue',
        mortgaged: true
      }]
    }});

    it('should not improve the property', function() {
      expect(() => this.dispatch(improveProperty('top-hat', 'oriental-avenue')))
        .toThrow(MonopolyError, /mortgaged/i);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 0);
    });

    it('should not improve other properties in the same group', function() {
      expect(() => this.dispatch(improveProperty('top-hat', 'connecticut-avenue')))
        .toThrow(MonopolyError, /mortgaged/i);
      expect(this.getProperty('connecticut-avenue')).toHaveProperty('buildings', 0);
    });
  });

  describe('when the property has an improvement', () => {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'oriental-avenue',
        buildings: 1
      }]
    }});

    it('should not improve unevenly', function() {
      expect(() => this.dispatch(improveProperty('top-hat', 'oriental-avenue')))
        .toThrow(MonopolyError, /evenly/i);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 1);
    });
  });

  describe('when the property is fully improved', () => {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'lightblue',
        buildings: 4
      }, {
        id: 'oriental-avenue',
        buildings: 5
      }]
    }});

    it('should not improve the property', function() {
      expect(() => this.dispatch(improveProperty('top-hat', 'oriental-avenue')))
        .toThrow(MonopolyError, /fully improved/i);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 5);
    });

    it('should still improve other unimproved properties', function() {
      this.dispatch(improveProperty('top-hat', 'connecticut-avenue'));
      expect(this.getProperty('connecticut-avenue')).toHaveProperty('buildings', 5);
    });
  });

  describe('when there are not enough houses', () => {
    modifyGameInTesting({ state: {
      houses: 0,
      properties: [{
        group: 'brown',
        monopoly: true,
        buildings: 4,
        owner: 'top-hat'
      }]
    }});

    it('should not improve the property when a house is needed', function() {
      expect(() => this.dispatch(improveProperty('top-hat', 'oriental-avenue')))
        .toThrow(MonopolyError, /houses/i);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 0);
    });

    it('should still improve the property when a hotel is needed', function() {
      this.dispatch(improveProperty('top-hat', 'baltic-avenue'));
      expect(this.getProperty('baltic-avenue')).toHaveProperty('buildings', 5);
    });
  });

  describe('when there are not enough hotels', () => {
    modifyGameInTesting({ state: {
      hotels: 0,
      properties: [{
        group: 'brown',
        monopoly: true,
        buildings: 4,
        owner: 'top-hat'
      }]
    }});

    it('should not improve the property when a hotel is needed', function() {
      expect(() => this.dispatch(improveProperty('top-hat', 'baltic-avenue')))
        .toThrow(MonopolyError, /hotels/i);
      expect(this.getProperty('baltic-avenue')).toHaveProperty('buildings', 4);
    });

    it('should still improve the property when a house is needed', function() {
      this.dispatch(improveProperty('top-hat', 'oriental-avenue'));
      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 1);
    });
  });
});
