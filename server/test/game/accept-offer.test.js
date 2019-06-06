import expect from 'expect';

import {
  getTradeId,
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { acceptOffer } from '../../src/actions/trades';

describe('Game: accepting a trade offer', () => {
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

    expect(this.state.trades).not.toHaveProperty(getTradeId('top-hat', 'automobile'));
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1400);
    expect(this.getPlayer('automobile')).toHaveProperty('balance', 1600);
    expect(this.getProperty('oriental-avenue')).toHaveProperty('owner', 'top-hat');
  });

  it('should not accept an offer that the player made themselves', function() {
    expect(() => this.dispatch(acceptOffer('top-hat', 'automobile')))
      .toThrow(MonopolyError, /cannot accept/i);
    expect(this.state.trades).toHaveProperty(getTradeId('top-hat', 'automobile'));
    expect(this.state.trades).toHaveProperty(getTradeId('top-hat', 'thimble'));
  });

  it('should not accept an offer that does not exist', function() {
    expect(() => this.dispatch(acceptOffer('automobile', 'thimble')))
      .toThrow(MonopolyError, /offer/);
    expect(this.state.trades).toHaveProperty(getTradeId('top-hat', 'automobile'));
    expect(this.state.trades).toHaveProperty(getTradeId('top-hat', 'thimble'));
    expect(this.state.trades).not.toHaveProperty(getTradeId('automobile', 'thimble'));
  });

  it('should not accept an offer for unowned properties', function() {
    expect(() => this.dispatch(acceptOffer('top-hat', 'thimble')))
      .toThrow(MonopolyError, /own/);
    expect(this.state.trades).toHaveProperty(getTradeId('top-hat', 'automobile'));
    expect(this.state.trades).toHaveProperty(getTradeId('top-hat', 'thimble'));
  });

  it('should create a notice', function() {
    this.dispatch(acceptOffer('automobile', 'top-hat'));

    expect(this.state.notice.id).toBe('trade.accepted');
    expect(this.state.notice.message).toMatch('accepted');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'automobile');
    expect(this.state.notice.meta).toHaveProperty('other.token', 'top-hat');
  });

  describe('when a player has a low balance', () => {
    modifyGameInTesting({ state: {
      players: [{
        token: 'top-hat',
        balance: 0
      }]
    }});

    it('should not accept an offer with an amount they cannot afford', function() {
      expect(() => this.dispatch(acceptOffer('automobile', 'top-hat')))
        .toThrow(MonopolyError, /insufficient/i);
      expect(this.state.trades).toHaveProperty(getTradeId('top-hat', 'automobile'));
      expect(this.state.trades).toHaveProperty(getTradeId('top-hat', 'thimble'));
    });
  });
});
