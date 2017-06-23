import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../game-helpers';

import MonopolyError from '../../../server/rules/error';
import { mortgageProperty } from '../../../server/actions/properties';

describe('Game: mortgaging properties', function() {
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

    expect(this.getProperty(property.id).mortgaged).to.be.true;
    expect(this.getPlayer('top-hat').balance).to.equal(1500 + value);
    expect(this.state.bank).to.equal(this.last.bank - value);
  });

  it('should not mortgage unowned properties', function() {
    expect(() => this.dispatch(mortgageProperty('top-hat', 'baltic-avenue')))
      .to.throw(MonopolyError, /not own/);
    expect(this.getProperty('baltic-avenue').mortgaged).to.be.false;
  });

  it('should not mortgage a property more than once', function() {
    const property = this.getProperty('oriental-avenue');
    const value = property.price * this.config.mortgageRate;

    this.dispatch(mortgageProperty('top-hat', property.id));

    expect(this.getProperty(property.id).mortgaged).to.be.true;
    expect(this.getPlayer('top-hat').balance).to.equal(1500 + value);
    expect(this.state.bank).to.equal(this.last.bank - value);

    expect(() => this.dispatch(mortgageProperty('top-hat', property.id)))
      .to.throw(MonopolyError, /is mortgaged/);
    expect(this.getPlayer('top-hat').balance).to.equal(1500 + value);
    expect(this.state.bank).to.equal(this.last.bank - value);
  });

  it('should create a notice', function() {
    this.dispatch(mortgageProperty('top-hat', 'oriental-avenue'));

    expect(this.state.notice.id).to.equal('property.mortgaged');
    expect(this.state.notice.message).to.match(/mortgaged/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
    expect(this.state.notice.meta).to.have.property('property')
      .that.has.property('id', 'oriental-avenue');
  });

  describe('when the bank is low', function() {
    modifyGameInTesting({ state: { bank: 0 }});

    it('should not mortgage the property', function() {
      expect(() => this.dispatch(mortgageProperty('top-hat', 'oriental-avenue')))
        .to.throw(MonopolyError, /insufficient/);
      expect(this.getProperty('oriental-avenue').mortgaged).to.be.false;
    });
  });

  describe('when the property has improvements', function() {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'connecticut-avenue',
        buildings: 1
      }]
    }});

    it('should not mortgage the property', function() {
      expect(() => this.dispatch(mortgageProperty('top-hat', 'oriental-avenue')))
        .to.throw(MonopolyError, /improved/);
      expect(this.getProperty('oriental-avenue').mortgaged).to.be.false;
    });
  });

  describe('with a custom mortgage rate', function() {
    modifyGameInTesting({ config: { mortgageRate: 1 }});

    it('should mortgage the property for the custom rate', function() {
      const property = this.getProperty('oriental-avenue');

      this.dispatch(mortgageProperty('top-hat', property.id));

      expect(this.getProperty(property.id).mortgaged).to.be.true;
      expect(this.getPlayer('top-hat').balance).to.equal(1500 + property.price);
      expect(this.state.bank).to.equal(this.last.bank - property.price);
    });
  });
});
