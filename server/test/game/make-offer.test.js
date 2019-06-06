import expect from 'expect';

import {
  getTradeId,
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { makeOffer } from '../../src/actions/trades';

describe('Game: making a trade offer', () => {
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

    expect(this.state.trades).toEqual({
      [tradeId]: {
        id: tradeId,
        from: 'top-hat',
        with: 'automobile',
        properties: [{ id: 'oriental-avenue' }],
        amount: 500
      }
    });
  });

  it('should not allow properties not owned by either player', function() {
    expect(() => this.dispatch(makeOffer('top-hat', 'automobile', {
      properties: ['st-james-place']
    }))).toThrow(MonopolyError, /unowned/);
    expect(this.state.trades).not.toHaveProperty(
      getTradeId('top-hat', 'automobile')
    );
  });

  it('should not allow amounts the player cannot afford', function() {
    expect(() => this.dispatch(makeOffer('top-hat', 'automobile', {
      amount: 2000
    }))).toThrow(MonopolyError, /insufficient/i);
    expect(this.state.trades).not.toHaveProperty(
      getTradeId('top-hat', 'automobile')
    );
  });

  it('should create a notice', function() {
    this.dispatch(makeOffer('top-hat', 'automobile', {
      properties: ['oriental-avenue']
    }));

    expect(this.state.notice.id).toBe('trade.new');
    expect(this.state.notice.message).toMatch('offered');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('other.token', 'automobile');
    expect(this.state.notice.meta).toHaveProperty('amount', 0);
  });

  describe('with an existing offer', () => {
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

      expect(this.state.trades).toEqual({
        [tradeId]: {
          id: tradeId,
          from: 'automobile',
          with: 'top-hat',
          properties: [{ id: 'oriental-avenue' }],
          amount: 500
        }
      });
    });

    it('should create a different notice', function() {
      this.dispatch(makeOffer('automobile', 'top-hat', {
        properties: ['oriental-avenue'],
        amount: 500
      }));

      expect(this.state.notice.id).toBe('trade.modified');
      expect(this.state.notice.message).toMatch('counter');
      expect(this.state.notice.meta).toHaveProperty('player.token', 'automobile');
      expect(this.state.notice.meta).toHaveProperty('other.token', 'top-hat');
      expect(this.state.notice.meta).toHaveProperty('amount', 500);
    });
  });
});
