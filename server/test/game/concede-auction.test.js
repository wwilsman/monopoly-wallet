import expect from 'expect';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { concedeAuction } from '../../src/actions/auction';

describe('Game: conceding from auctions', () => {
  setupGameForTesting({ state: {
    players: [
      { token: 'top-hat' },
      { token: 'automobile' }
    ],
    auction: {
      property: 'oriental-avenue',
      players: ['top-hat', 'automobile']
    }
  }});

  beforeEach(function() {
    this.dispatch(concedeAuction('top-hat'));
  });

  it('should remove the player from the auction', function() {
    expect(this.state.auction.players).not.toContain('top-hat');
    expect(this.state.auction.players).toContain('automobile');
  });

  it('should cancel the auction when all players concede', function() {
    this.dispatch(concedeAuction('automobile'));
    expect(this.state.auction).toBe(false);
  });

  it('should create a notice', function() {
    expect(this.state.notice.id).toEqual('auction.conceded');
    expect(this.state.notice.message).toMatch('conceded');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
  });

  it('should create a different notice when the auction is cancelled', function() {
    this.dispatch(concedeAuction('automobile'));
    expect(this.state.notice.id).toEqual('auction.cancelled');
    expect(this.state.notice.message).toMatch('cancelled');
    expect(this.state.notice.meta).toHaveProperty('property.id', 'oriental-avenue');
  });

  describe('when winning', () => {
    modifyGameInTesting({ state: {
      auction: {
        winning: 'top-hat',
        amount: 50
      }
    }});

    it('should not remove the winning player', function() {
      expect(() => this.dispatch(concedeAuction('top-hat')))
        .toThrow(MonopolyError, /winning/);
      expect(this.state.auction.players).toContain('top-hat');
      expect(this.state.auction.players).toContain('automobile');
    });
  });

  describe('with no auction', () => {
    modifyGameInTesting({ state: { auction: false }});

    it('should throw an error', function() {
      expect(() => this.dispatch(concedeAuction('top-hat')))
        .toThrow(MonopolyError, /no/i);
    });
  });
});
