import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { makeOffer } from '../../../server/actions/trades';

describe('Game: making a trade offer', function() {
  setupGameForTesting({ state: {
    players: [
      { token: 'top-hat' },
      { token: 'automobile' }
    ],
    properties: [{
      id: 'oriental-avenue',
      owner: 'top-hat'
    }]
  }});

  it('should initiate a new trade with another player', function() {
    const trade = { amount: 500, properties: ['oriental-avenue'] };
    this.dispatch(makeOffer('top-hat', 'automobile', trade));

    expect(this.state.trades[0]).to.deep.equal({
      players: ['top-hat', 'automobile'],
      properties: ['oriental-avenue'],
      amount: 500
    });
  });

  it('should not allow properties not owned by either player', function() {
    const trade = { properties: ['st-james-place'] };
    expect(() => this.dispatch(makeOffer('top-hat', 'automobile', trade)))
      .to.throw(MonopolyError, /unowned/);
    expect(this.state.trades).to.have.lengthOf(0);
  });

  it('should not allow amounts the player cannot afford', function() {
    const trade = { amount: 2000 };
    expect(() => this.dispatch(makeOffer('top-hat', 'automobile', trade)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.state.trades).to.have.lengthOf(0);
  });

  describe('with an existing offer', function() {
    modifyGameInTesting({ state: {
      trades: [{
        players: ['top-hat', 'automobile'],
        properties: ['oriental-avenue']
      }]
    }});

    it('should modify the current offer', function() {
      const trade = { amount: 500, properties: ['oriental-avenue'] };
      this.dispatch(makeOffer('automobile', 'top-hat', trade));

      expect(this.state.trades).to.have.lengthOf(1);
      expect(this.state.trades[0]).to.deep.equal({
        players: ['automobile', 'top-hat'],
        properties: ['oriental-avenue'],
        amount: 500
      });
    });
  });
});
