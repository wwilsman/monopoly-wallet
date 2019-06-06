import expect from 'expect';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { unmortgageProperty } from '../../src/actions/properties';

describe('Game: unmortgaging properties', () => {
  setupGameForTesting({ state: {
    bank: 100,
    players: [{ token: 'top-hat' }],
    properties: [{
      id: 'oriental-avenue',
      owner: 'top-hat',
      mortgaged: true
    }, {
      id: 'baltic-avenue',
      mortgaged: true
    }]
  }});

  it('should unmortgage the property', function() {
    const property = this.getProperty('oriental-avenue');
    const principle = property.price * this.config.mortgageRate;
    const interest = principle * this.config.interestRate;

    this.dispatch(unmortgageProperty('top-hat', property.id));

    expect(this.getProperty(property.id)).toHaveProperty('mortgaged', false);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 - (principle + interest));
    expect(this.state.bank).toBe(this.last.bank + (principle + interest));
  });

  it('should not unmortgage unowned properties', function() {
    expect(() => this.dispatch(unmortgageProperty('top-hat', 'baltic-avenue')))
      .toThrow(MonopolyError, /not own/);
    expect(this.getProperty('baltic-avenue')).toHaveProperty('mortgaged', true);
  });

  it('should not unmortgage a property more than once', function() {
    const property = this.getProperty('oriental-avenue');
    const principle = property.price * this.config.mortgageRate;
    const interest = principle * this.config.interestRate;

    this.dispatch(unmortgageProperty('top-hat', property.id));

    expect(this.getProperty(property.id)).toHaveProperty('mortgaged', false);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 - (principle + interest));
    expect(this.state.bank).toBe(this.last.bank + (principle + interest));

    expect(() => this.dispatch(unmortgageProperty('top-hat', property.id)))
      .toThrow(MonopolyError, /not mortgaged/);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 - (principle + interest));
    expect(this.state.bank).toBe(this.last.bank + (principle + interest));
  });

  it('should create a notice', function() {
    const property = this.getProperty('oriental-avenue');
    const principle = property.price * this.config.mortgageRate;
    const interest = principle * this.config.interestRate;

    this.dispatch(unmortgageProperty('top-hat', property.id));

    expect(this.state.notice.id).toBe('property.unmortgaged');
    expect(this.state.notice.message).toMatch('unmortgaged');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('property.id', property.id);
    expect(this.state.notice.meta).toHaveProperty('amount', principle + interest);
  });

  describe('when the player has a low balance', () => {
    modifyGameInTesting({ state: {
      players: [{
        token: 'top-hat',
        balance: 0
      }]
    }});

    it('should not unmortgage the property', function() {
      expect(() => this.dispatch(unmortgageProperty('top-hat', 'oriental-avenue')))
        .toThrow(MonopolyError, /insufficient/i);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('mortgaged', true);
    });
  });

  describe('with a custom interest rate', () => {
    modifyGameInTesting({ config: {
      mortgageRate: 1,
      interestRate: 0
    }});

    it('should unmortgage the property for the custom rate', function() {
      const property = this.getProperty('oriental-avenue');

      this.dispatch(unmortgageProperty('top-hat', property.id));

      expect(this.getProperty(property.id)).toHaveProperty('mortgaged', false);
      expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 - property.price);
      expect(this.state.bank).toBe(this.last.bank + property.price);
    });
  });
});
