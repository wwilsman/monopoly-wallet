import { describe, it } from 'mocha';
import { expect } from 'chai';

import { setupGameForTesting } from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { buyProperty } from '../../../server/actions/properties';

describe('Game: buying properties', function() {
  setupGameForTesting({ state: {
    players: [
      { id: 'player-1' },
      { id: 'player-2' }
    ],
    properties: [{
      id: 'oriental-avenue',
      owner: 'player-2'
    }]
  }});

  it('should buy the property for the player', function() {
    const property = this.getProperty('baltic-avenue');

    this.dispatch(buyProperty('player-1', 'baltic-avenue'));

    expect(this.getProperty(property.id).owner).to.equal('player-1');
    expect(this.getPlayer('player-1').balance).to.equal(this.config.playerStart - property.price);
    expect(this.state.bank).to.equal(this.last.bank + property.price);
  });

  it('should buy the property for a specific price', function() {
    this.dispatch(buyProperty('player-1', 'baltic-avenue', 10));

    expect(this.getProperty('baltic-avenue').owner).to.equal('player-1');
    expect(this.getPlayer('player-1').balance).to.equal(this.config.playerStart - 10);
    expect(this.state.bank).to.equal(this.last.bank + 10);
  });

  it('should not buy the property for a negative price', function() {
    expect(() => this.dispatch(buyProperty('player-1', 'baltic-avenue', -10)))
      .to.throw(MonopolyError, /negative/);
    expect(this.getProperty('baltic-avenue').owner).to.not.equal('player-1');
  });

  it('should not buy the property when already owned', function() {
    expect(() => this.dispatch(buyProperty('player-1', 'oriental-avenue')))
      .to.throw(MonopolyError, /owns/);
    expect(this.getProperty('oriental-avenue').owner).to.equal('player-2');
  });

  it('should not buy the property with insufficient funds', function() {
    expect(() => this.dispatch(buyProperty('player-1', 'baltic-avenue', this.config.playerStart + 1)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.getProperty('baltic-avenue').owner).to.not.equal('player-1');
  });
});
