import expect from 'expect';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { mortgageProperty } from '../../src/actions/properties';

describe('Game: mortgaging properties', () => {
  setupGameForTesting({ state: {
    bank: 100,
    players: [{ token: 'top-hat' }],
    properties: [{
      id: 'oriental-avenue',
      owner: 'top-hat'
    }]
  }});

  it('should mortgage the property', function() {
    const property = this.getProperty('oriental-avenue');
    const value = property.price * this.config.mortgageRate;

    this.dispatch(mortgageProperty('top-hat', property.id));

    expect(this.getProperty(property.id)).toHaveProperty('mortgaged', true);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 + value);
    expect(this.state.bank).toBe(this.last.bank - value);
  });

  it('should not mortgage unowned properties', function() {
    expect(() => this.dispatch(mortgageProperty('top-hat', 'baltic-avenue')))
      .toThrow(MonopolyError, /not own/);
    expect(this.getProperty('baltic-avenue')).toHaveProperty('mortgaged', false);
  });

  it('should not mortgage a property more than once', function() {
    const property = this.getProperty('oriental-avenue');
    const value = property.price * this.config.mortgageRate;

    this.dispatch(mortgageProperty('top-hat', property.id));

    expect(this.getProperty(property.id)).toHaveProperty('mortgaged', true);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 + value);
    expect(this.state.bank).toBe(this.last.bank - value);

    expect(() => this.dispatch(mortgageProperty('top-hat', property.id)))
      .toThrow(MonopolyError, /is mortgaged/);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 + value);
    expect(this.state.bank).toBe(this.last.bank - value);
  });

  it('should create a notice', function() {
    this.dispatch(mortgageProperty('top-hat', 'oriental-avenue'));

    expect(this.state.notice.id).toBe('property.mortgaged');
    expect(this.state.notice.message).toMatch('mortgaged');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('property.id', 'oriental-avenue');
  });

  describe('when the bank is low', () => {
    modifyGameInTesting({ state: { bank: 0 }});

    it('should not mortgage the property', function() {
      expect(() => this.dispatch(mortgageProperty('top-hat', 'oriental-avenue')))
        .toThrow(MonopolyError, /insufficient/);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('mortgaged', false);
    });
  });

  describe('when the property has improvements', () => {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'connecticut-avenue',
        buildings: 1
      }]
    }});

    it('should not mortgage the property', function() {
      expect(() => this.dispatch(mortgageProperty('top-hat', 'oriental-avenue')))
        .toThrow(MonopolyError, /improved/);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('mortgaged', false);
    });
  });

  describe('with a custom mortgage rate', () => {
    modifyGameInTesting({ config: { mortgageRate: 1 }});

    it('should mortgage the property for the custom rate', function() {
      const property = this.getProperty('oriental-avenue');

      this.dispatch(mortgageProperty('top-hat', property.id));

      expect(this.getProperty(property.id)).toHaveProperty('mortgaged', true);
      expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 + property.price);
      expect(this.state.bank).toBe(this.last.bank - property.price);
    });
  });
});
