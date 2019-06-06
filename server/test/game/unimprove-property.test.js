import expect from 'expect';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { unimproveProperty } from '../../src/actions/properties';

describe('Game: unimproving properties', () => {
  setupGameForTesting({ state: {
    players: [{ token: 'top-hat' }],
    properties: [{
      group: 'lightblue',
      owner: 'top-hat',
      buildings: 4
    }]
  }});

  it('should remove a house from the property', function() {
    const property = this.getProperty('oriental-avenue');
    const value = property.cost * this.config.buildingRate;

    this.dispatch(unimproveProperty('top-hat', property.id));

    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 + value);
    expect(this.state.bank).toBe(this.last.bank - value);
    expect(this.getProperty(property.id)).toHaveProperty('buildings', 3);
    expect(this.state.houses).toBe(this.last.houses + 1);
  });

  it('should not unimprove an unowned property', function() {
    expect(() => this.dispatch(unimproveProperty('top-hat', 'baltic-avenue')))
      .toThrow(MonopolyError, /not own/i);
  });

  it('should create a notice', function() {
    const property = this.getProperty('oriental-avenue');
    const value = property.cost * this.config.buildingRate;

    this.dispatch(unimproveProperty('top-hat', property.id));

    expect(this.state.notice.id).toBe('property.unimproved');
    expect(this.state.notice.message).toMatch('unimproved');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('property.id', property.id);
    expect(this.state.notice.meta).toHaveProperty('amount', value);
  });

  describe('when a property is fully improved', () => {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'oriental-avenue',
        buildings: 5
      }]
    }});

    it('should remove a hotel and add 4 houses', function() {
      this.dispatch(unimproveProperty('top-hat', 'oriental-avenue'));

      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 4);
      expect(this.state.houses).toBe(this.last.houses - 4);
      expect(this.state.hotels).toBe(this.last.hotels + 1);
    });
  });

  describe('when the bank is low', () => {
    modifyGameInTesting({ state: { bank: 0 }});

    it('should not unimprove the property', function() {
      expect(() => this.dispatch(unimproveProperty('top-hat', 'oriental-avenue')))
        .toThrow(MonopolyError, /insufficient/i);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 4);
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

    it('should not unimprove a railroad', function() {
      expect(() => this.dispatch(unimproveProperty('top-hat', 'reading-railroad')))
        .toThrow(MonopolyError, /improve a railroad/i);
    });

    it('should not unimprove a utility', function() {
      expect(() => this.dispatch(unimproveProperty('top-hat', 'electric-company')))
        .toThrow(MonopolyError, /improve a utility/i);
    });
  });

  describe('when the property has less improvements', () => {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'oriental-avenue',
        buildings: 3
      }]
    }});

    it('should not unimprove unevenly', function() {
      expect(() => this.dispatch(unimproveProperty('top-hat', 'oriental-avenue')))
        .toThrow(MonopolyError, /evenly/i);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 3);
    });

    it('should still unimprove other improved properties', function() {
      this.dispatch(unimproveProperty('top-hat', 'connecticut-avenue'));
      expect(this.getProperty('connecticut-avenue')).toHaveProperty('buildings', 3);
    });
  });

  describe('when the property has no improvements', () => {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'lightblue',
        buildings: 0
      }]
    }});

    it('should not unimprove the property', function() {
      expect(() => this.dispatch(unimproveProperty('top-hat', 'oriental-avenue')))
        .toThrow(MonopolyError, /unimproved/i);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 0);
    });
  });

  describe('when there are not enough houses', () => {
    modifyGameInTesting({ state: {
      houses: 0,
      properties: [{
        group: 'brown',
        owner: 'top-hat',
        buildings: 5
      }]
    }});

    it('should not unimprove the property when houses are needed', function() {
      expect(() => this.dispatch(unimproveProperty('top-hat', 'baltic-avenue')))
        .toThrow(MonopolyError, /houses/i);
      expect(this.getProperty('baltic-avenue')).toHaveProperty('buildings', 5);
    });

    it('should still unimprove the property when no houses are needed', function() {
      this.dispatch(unimproveProperty('top-hat', 'oriental-avenue'));
      expect(this.getProperty('oriental-avenue')).toHaveProperty('buildings', 3);
    });
  });
});
