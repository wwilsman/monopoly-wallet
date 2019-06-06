import expect from 'expect';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { closeAuction } from '../../src/actions/auction';

describe('Game: closing auctions', () => {
  setupGameForTesting({ state: {
    bank: 100,
    players: [
      { token: 'top-hat' },
      { token: 'automobile' }
    ],
    auction: {
      property: 'oriental-avenue'
    }
  }});

  it('should close the auction', function() {
    this.dispatch(closeAuction());

    expect(this.state.auction).toBe(false);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500);
    expect(this.getProperty('oriental-avenue')).toHaveProperty('owner', 'bank');
  });

  it('should create a notice', function() {
    this.dispatch(closeAuction());

    expect(this.state.notice.id).toBe('auction.cancelled');
    expect(this.state.notice.message).toMatch('cancelled');
    expect(this.state.notice.meta).toHaveProperty('property.id', 'oriental-avenue');
  });

  describe('when winning the auction', () => {
    modifyGameInTesting({ state: {
      auction: {
        winning: 'top-hat',
        amount: 100
      }
    }});

    it('should buy the property at the bid amount', function() {
      this.dispatch(closeAuction());

      expect(this.state.auction).toBe(false);
      expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1400);
      expect(this.getProperty('oriental-avenue')).toHaveProperty('owner', 'top-hat');
      expect(this.state.bank).toBe(200);
    });

    it('should create a different notice', function() {
      this.dispatch(closeAuction());

      expect(this.state.notice.id).toBe('auction.won');
      expect(this.state.notice.message).toMatch(/won .* at auction/);
      expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
      expect(this.state.notice.meta).toHaveProperty('property.id', 'oriental-avenue');
      expect(this.state.notice.meta).toHaveProperty('amount', 100);
    });
  });

  describe('when winning with a low balance', () => {
    modifyGameInTesting({ state: {
      players: [{
        token: 'top-hat',
        balance: 0
      }],
      auction: {
        winning: 'top-hat',
        amount: 100
      }
    }});

    it('should not close the auction', function() {
      expect(() => this.dispatch(closeAuction()))
        .toThrow(MonopolyError, /insufficient/i);
      expect(this.state.auction).toBeInstanceOf(Object);
    });
  });

  describe('when there is no auction', () => {
    modifyGameInTesting({ state: { auction: false }});

    it('should throw an error', function() {
      expect(() => this.dispatch(closeAuction()))
        .toThrow(MonopolyError, /no/i);
    });
  });
});
