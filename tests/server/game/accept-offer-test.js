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
import { acceptOffer } from '../../../server/actions/trades';

describe('Game: accepting a trade offer', function() {
  setupGameForTesting({ state: {
    players: [
      { token: 'top-hat' },
      { token: 'automobile' },
      { token: 'thimble' }
    ],
    properties: [{
      id: 'oriental-avenue',
      owner: 'automobile'
    }],
    trades: [{
      from: 'top-hat',
      with: 'automobile',
      properties: ['oriental-avenue'],
      amount: 100
    }, {
      from: 'thimble',
      with: 'top-hat',
      properties: ['oriental-avenue']
    }]
  }});

  it('should transfer properties and an amount', function() {
    this.dispatch(acceptOffer('automobile', 'top-hat'));

    expect(this.state.trades).to.not.have.property(getTradeId('top-hat', 'automobile'));
    expect(this.getPlayer('top-hat').balance).to.equal(1400);
    expect(this.getPlayer('automobile').balance).to.equal(1600);
    expect(this.getProperty('oriental-avenue').owner).to.equal('top-hat');
  });

  it('should not accept an offer that the player made themselves', function() {
    expect(() => this.dispatch(acceptOffer('top-hat', 'automobile')))
      .to.throw(MonopolyError, /cannot accept/i);
    expect(this.state.trades).to.have.property(getTradeId('top-hat', 'automobile'));
    expect(this.state.trades).to.have.property(getTradeId('top-hat', 'thimble'));
  });

  it('should not accept an offer that does not exist', function() {
    expect(() => this.dispatch(acceptOffer('automobile', 'thimble')))
      .to.throw(MonopolyError, /offer/);
    expect(this.state.trades).to.have.property(getTradeId('top-hat', 'automobile'));
    expect(this.state.trades).to.have.property(getTradeId('top-hat', 'thimble'));
    expect(this.state.trades).to.not.have.property(getTradeId('automobile', 'thimble'));
  });

  it('should not accept an offer for unowned properties', function() {
    expect(() => this.dispatch(acceptOffer('top-hat', 'thimble')))
      .to.throw(MonopolyError, /own/);
    expect(this.state.trades).to.have.property(getTradeId('top-hat', 'automobile'));
    expect(this.state.trades).to.have.property(getTradeId('top-hat', 'thimble'));
  });

  describe('when a player has a low balance', function() {
    modifyGameInTesting({ state: {
      players: [{
        token: 'top-hat',
        balance: 0
      }]
    }});

    it('should not accept an offer with an amount they cannot afford', function() {
      expect(() => this.dispatch(acceptOffer('automobile', 'top-hat')))
        .to.throw(MonopolyError, /insufficient/i);
      expect(this.state.trades).to.have.property(getTradeId('top-hat', 'automobile'));
      expect(this.state.trades).to.have.property(getTradeId('top-hat', 'thimble'));
    });
  });
});
