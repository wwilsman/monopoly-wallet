import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { unmortgageProperty } from '../../../server/actions/properties';

describe('Game: unmortgaging properties', function() {
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

    expect(this.getProperty(property.id).mortgaged).to.be.false;
    expect(this.getPlayer('top-hat').balance).to.equal(1500 - (principle + interest));
    expect(this.state.bank).to.equal(this.last.bank + (principle + interest));
  });

  it('should not unmortgage unowned properties', function() {
    expect(() => this.dispatch(unmortgageProperty('top-hat', 'baltic-avenue')))
      .to.throw(MonopolyError, /not own/);
    expect(this.getProperty('baltic-avenue').mortgaged).to.be.true;
  });

  it('should not unmortgage a property more than once', function() {
    const property = this.getProperty('oriental-avenue');
    const principle = property.price * this.config.mortgageRate;
    const interest = principle * this.config.interestRate;

    this.dispatch(unmortgageProperty('top-hat', property.id));

    expect(this.getProperty(property.id).mortgaged).to.be.false;
    expect(this.getPlayer('top-hat').balance).to.equal(1500 - (principle + interest));
    expect(this.state.bank).to.equal(this.last.bank + (principle + interest));

    expect(() => this.dispatch(unmortgageProperty('top-hat', property.id)))
      .to.throw(MonopolyError, /not mortgaged/);
    expect(this.getPlayer('top-hat').balance).to.equal(1500 - (principle + interest));
    expect(this.state.bank).to.equal(this.last.bank + (principle + interest));
  });

  describe('when the player has a low balance', function() {
    modifyGameInTesting({ state: {
      players: [{
        token: 'top-hat',
        balance: 0
      }]
    }});

    it('should not unmortgage the property', function() {
      expect(() => this.dispatch(unmortgageProperty('top-hat', 'oriental-avenue')))
        .to.throw(MonopolyError, /insufficient/i);
      expect(this.getProperty('oriental-avenue').mortgaged).to.be.true;
    });
  });

  describe('with a custom interest rate', function() {
    modifyGameInTesting({ config: {
      mortgageRate: 1,
      interestRate: 0
    }});

    it('should unmortgage the property for the custom rate', function() {
      const property = this.getProperty('oriental-avenue');

      this.dispatch(unmortgageProperty('top-hat', property.id));

      expect(this.getProperty(property.id).mortgaged).to.be.false;
      expect(this.getPlayer('top-hat').balance).to.equal(1500 - property.price);
      expect(this.state.bank).to.equal(this.last.bank + property.price);
    });
  });
});
