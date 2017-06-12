import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { mortgageProperty } from '../../../server/actions/properties';

describe('Game: mortgaging properties', function() {
  setupGameForTesting({ state: {
    bank: 100,
    players: [{ id: 'player-1' }],
    properties: [{
      id: 'oriental-avenue',
      owner: 'player-1'
    }]
  }});

  it('should mortgage the property', function() {
    const property = this.getProperty('oriental-avenue');
    const value = property.price * this.config.mortgageRate;

    this.dispatch(mortgageProperty('player-1', property.id));

    expect(this.getProperty(property.id).mortgaged).to.be.true;
    expect(this.getPlayer('player-1').balance).to.equal(1500 + value);
    expect(this.state.bank).to.equal(this.last.bank - value);
  });

  it('should not mortgage unowned properties', function() {
    expect(() => this.dispatch(mortgageProperty('player-1', 'baltic-avenue')))
      .to.throw(MonopolyError, /not own/);
    expect(this.getProperty('baltic-avenue').mortgaged).to.be.false;
  });

  it('should not mortgage a property more than once', function() {
    const property = this.getProperty('oriental-avenue');
    const value = property.price * this.config.mortgageRate;

    this.dispatch(mortgageProperty('player-1', property.id));

    expect(this.getProperty(property.id).mortgaged).to.be.true;
    expect(this.getPlayer('player-1').balance).to.equal(1500 + value);
    expect(this.state.bank).to.equal(this.last.bank - value);

    expect(() => this.dispatch(mortgageProperty('player-1', property.id)))
      .to.throw(MonopolyError, /is mortgaged/);
    expect(this.getPlayer('player-1').balance).to.equal(1500 + value);
    expect(this.state.bank).to.equal(this.last.bank - value);
  });

  describe('when the bank is low', function() {
    modifyGameInTesting({ state: { bank: 0 }});

    it('should not mortgage the property', function() {
      expect(() => this.dispatch(mortgageProperty('player-1', 'oriental-avenue')))
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
      expect(() => this.dispatch(mortgageProperty('player-1', 'oriental-avenue')))
        .to.throw(MonopolyError, /improved/);
      expect(this.getProperty('oriental-avenue').mortgaged).to.be.false;
    });
  });

  describe('with a custom mortgage rate', function() {
    modifyGameInTesting({ config: { mortgageRate: 1 }});

    it('should mortgage the property for the custom rate', function() {
      const property = this.getProperty('oriental-avenue');

      this.dispatch(mortgageProperty('player-1', property.id));

      expect(this.getProperty(property.id).mortgaged).to.be.true;
      expect(this.getPlayer('player-1').balance).to.equal(1500 + property.price);
      expect(this.state.bank).to.equal(this.last.bank - property.price);
    });
  });
});
