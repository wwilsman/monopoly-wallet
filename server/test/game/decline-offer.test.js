import expect from 'expect';

import {
  getTradeId,
  setupGameForTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { declineOffer } from '../../src/actions/trades';

describe('Game: declining a trade offer', () => {
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

    expect(this.state.trades).not.toHaveProperty(getTradeId('top-hat', 'automobile'));
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500);
    expect(this.getPlayer('automobile')).toHaveProperty('balance', 1500);
    expect(this.getProperty('oriental-avenue')).toHaveProperty('owner', 'automobile');
  });

  it('should not decline an offer that does not exist', function() {
    expect(() => this.dispatch(declineOffer('top-hat', 'thimble')))
      .toThrow(MonopolyError, /offer/);
    expect(this.state.trades).toHaveProperty(getTradeId('top-hat', 'automobile'));
    expect(this.state.trades).not.toHaveProperty(getTradeId('top-hat', 'thimble'));
  });

  it('should create a notice', function() {
    this.dispatch(declineOffer('automobile', 'top-hat'));

    expect(this.state.notice.id).toBe('trade.declined');
    expect(this.state.notice.message).toMatch('declined');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'automobile');
    expect(this.state.notice.meta).toHaveProperty('other.token', 'top-hat');
  });
});
