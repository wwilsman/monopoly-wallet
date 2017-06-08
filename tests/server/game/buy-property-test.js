import { describe, it } from 'mocha';
import { expect } from 'chai';

import { setupGameForTesting } from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { buyProperty } from '../../../server/actions';

describe('Game: buying properties', function() {
  setupGameForTesting({ state: {
    players: [{
      id: 'p1',
      name: 'Player 1',
      token: 'top-hat'
    }, {
      id: 'p2',
      name: 'Player 2',
      token: 'automobile'
    }],
    properties: [{
      id: 'oriental-avenue',
      owner: 'p2'
    }]
  }});

  it('should buy the property for the player', function() {
    const property = this.getProperty('baltic-avenue');

    this.dispatch(buyProperty('p1', 'baltic-avenue'));

    expect(this.getProperty(property.id).owner).to.equal('p1');
    expect(this.getPlayer('p1').balance).to.equal(this.config.playerStart - property.price);
    expect(this.state.bank).to.equal(this.last.bank + property.price);
  });

  it('should buy the property for a specific price', function() {
    this.dispatch(buyProperty('p1', 'baltic-avenue', 10));

    expect(this.getProperty('baltic-avenue').owner).to.equal('p1');
    expect(this.getPlayer('p1').balance).to.equal(this.config.playerStart - 10);
    expect(this.state.bank).to.equal(this.last.bank + 10);
  });

  it('should not buy the property for a negative price', function() {
    expect(() => this.dispatch(buyProperty('p1', 'baltic-avenue', -10)))
      .to.throw(MonopolyError, /negative/);
    expect(this.getProperty('baltic-avenue').owner).to.not.equal('p1');
  });

  it('should not buy the property when already owned', function() {
    expect(() => this.dispatch(buyProperty('p1', 'oriental-avenue')))
      .to.throw(MonopolyError, /owned/);
    expect(this.getProperty('oriental-avenue').owner).to.equal('p2');
  });

  it('should not buy the property with insufficient funds', function() {
    expect(() => this.dispatch(buyProperty('p1', 'baltic-avenue', this.config.playerStart + 1)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.getProperty('baltic-avenue').owner).to.not.equal('p1');
  });
});
