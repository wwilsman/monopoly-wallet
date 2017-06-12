import { describe, it } from 'mocha';
import { expect } from 'chai';

import { setupGameForTesting } from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { makeOffer } from '../../../server/actions/trades';

describe('Game: making a trade offer', function() {
  setupGameForTesting({ state: {
    players: [
      { id: 'player-1' },
      { id: 'player-2' }
    ],
    properties: [{
      id: 'oriental-avenue',
      owner: 'player-1'
    }]
  }});

  it('should initiate a new trade with another player', function() {
    const trade = { amount: 500, properties: ['oriental-avenue'] };
    this.dispatch(makeOffer('player-1', 'player-2', trade));

    expect(this.state.trades[0]).to.deep.equal({
      players: ['player-1', 'player-2'],
      properties: ['oriental-avenue'],
      amount: 500
    });
  });

  it('should not allow properties not owned by either player', function() {
    const trade = { properties: ['st-james-place'] };
    expect(() => this.dispatch(makeOffer('player-1', 'player-2', trade)))
      .to.throw(MonopolyError, /unowned/);
    expect(this.state.trades).to.have.lengthOf(0);
  });

  it('should not allow amounts the player cannot afford', function() {
    const trade = { amount: 2000 };
    expect(() => this.dispatch(makeOffer('player-1', 'player-2', trade)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.state.trades).to.have.lengthOf(0);
  });
});
