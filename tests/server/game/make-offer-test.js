import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../test-helpers';
import {
  getTradeId
} from '../../../server/helpers';

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
    const tradeId = getTradeId('top-hat', 'automobile');

    this.dispatch(makeOffer('top-hat', 'automobile', {
      properties: ['oriental-avenue'],
      amount: 500
    }));

    expect(this.state.trades).to.deep.equal({
      [tradeId]: {
        id: tradeId,
        from: 'top-hat',
        with: 'automobile',
        properties: ['oriental-avenue'],
        amount: 500
      }
    });
  });

  it('should not allow properties not owned by either player', function() {
    expect(() => this.dispatch(makeOffer('top-hat', 'automobile', {
      properties: ['st-james-place']
    }))).to.throw(MonopolyError, /unowned/);
    expect(this.state.trades).to.not.have.property(
      getTradeId('top-hat', 'automobile')
    );
  });

  it('should not allow amounts the player cannot afford', function() {
    expect(() => this.dispatch(makeOffer('top-hat', 'automobile', {
      amount: 2000
    }))).to.throw(MonopolyError, /insufficient/i);
    expect(this.state.trades).to.not.have.property(
      getTradeId('top-hat', 'automobile')
    );
  });

  describe('with an existing offer', function() {
    modifyGameInTesting({ state: {
      trades: [{
        from: 'top-hat',
        with: 'automobile',
        properties: ['oriental-avenue']
      }]
    }});

    it('should modify the existing offer', function() {
      const tradeId = getTradeId('top-hat', 'automobile');

      this.dispatch(makeOffer('automobile', 'top-hat', {
        properties: ['oriental-avenue'],
        amount: 500
      }));

      expect(this.state.trades).to.deep.equal({
        [tradeId]: {
          id: tradeId,
          from: 'automobile',
          with: 'top-hat',
          properties: ['oriental-avenue'],
          amount: 500
        }
      });
    });
  });
});
