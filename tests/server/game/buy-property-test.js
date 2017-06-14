import { describe, it } from 'mocha';
import { expect } from 'chai';

import { setupGameForTesting } from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { buyProperty } from '../../../server/actions/properties';

describe('Game: buying properties', function() {
  setupGameForTesting({ state: {
    players: [
      { token: 'top-hat' },
      { token: 'automobile' }
    ],
    properties: [{
      id: 'oriental-avenue',
      owner: 'automobile'
    }]
  }});

  it('should buy the property for the player', function() {
    const property = this.getProperty('baltic-avenue');

    this.dispatch(buyProperty('top-hat', 'baltic-avenue'));

    expect(this.getProperty(property.id).owner).to.equal('top-hat');
    expect(this.getPlayer('top-hat').balance).to.equal(this.config.playerStart - property.price);
    expect(this.state.bank).to.equal(this.last.bank + property.price);
  });

  it('should buy the property for a specific price', function() {
    this.dispatch(buyProperty('top-hat', 'baltic-avenue', 10));

    expect(this.getProperty('baltic-avenue').owner).to.equal('top-hat');
    expect(this.getPlayer('top-hat').balance).to.equal(this.config.playerStart - 10);
    expect(this.state.bank).to.equal(this.last.bank + 10);
  });

  it('should not buy the property for a negative price', function() {
    expect(() => this.dispatch(buyProperty('top-hat', 'baltic-avenue', -10)))
      .to.throw(MonopolyError, /negative/);
    expect(this.getProperty('baltic-avenue').owner).to.not.equal('top-hat');
  });

  it('should not buy the property when already owned', function() {
    expect(() => this.dispatch(buyProperty('top-hat', 'oriental-avenue')))
      .to.throw(MonopolyError, /owned/);
    expect(this.getProperty('oriental-avenue').owner).to.equal('automobile');
  });

  it('should not buy the property with insufficient funds', function() {
    expect(() => this.dispatch(buyProperty('top-hat', 'baltic-avenue', this.config.playerStart + 1)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.getProperty('baltic-avenue').owner).to.not.equal('top-hat');
  });
});
