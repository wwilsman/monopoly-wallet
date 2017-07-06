import { describe, it } from 'mocha';
import { expect } from 'chai';

import { getTradeId } from '../../helpers';
import { setupGameForTesting } from '../game-helpers';

import MonopolyError from '../../../server/error';
import { declineOffer } from '../../../server/actions/trades';

describe('Game: declining a trade offer', function() {
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
    }]
  }});

  it('should remove the current offer from the state', function() {
    this.dispatch(declineOffer('automobile', 'top-hat'));

    expect(this.state.trades).to.not.have.property(getTradeId('top-hat', 'automobile'));
    expect(this.getPlayer('top-hat').balance).to.equal(1500);
    expect(this.getPlayer('automobile').balance).to.equal(1500);
    expect(this.getProperty('oriental-avenue').owner).to.equal('automobile');
  });

  it('should not decline an offer that does not exist', function() {
    expect(() => this.dispatch(declineOffer('top-hat', 'thimble')))
      .to.throw(MonopolyError, /offer/);
    expect(this.state.trades).to.have.property(getTradeId('top-hat', 'automobile'));
    expect(this.state.trades).to.not.have.property(getTradeId('top-hat', 'thimble'));
  });

  it('should create a notice', function() {
    this.dispatch(declineOffer('automobile', 'top-hat'));

    expect(this.state.notice.id).to.equal('trade.declined');
    expect(this.state.notice.message).to.match(/declined/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'automobile');
    expect(this.state.notice.meta).to.have.property('other')
      .that.has.property('token', 'top-hat');
  });
});
