import expect from 'expect';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { placeBid } from '../../src/actions/auction';

describe('Game: bidding in auctions', () => {
  setupGameForTesting({ state: {
    players: [
      { token: 'top-hat' },
      { token: 'automobile' },
      { token: 'thimble', balance: 100 },
      { token: 'iron' }
    ],
    auction: {
      property: 'oriental-avenue',
      players: ['top-hat', 'automobile', 'thimble']
    }
  }});

  beforeEach(function() {
    this.dispatch(placeBid('top-hat', 100));
  });

  it('should place a bid in the auction', function() {
    expect(this.state.auction).toMatchObject({ winning: 'top-hat', amount: 100 });
  });

  it('should place a bid higher than the current bid', function() {
    this.dispatch(placeBid('automobile', 200));
    expect(this.state.auction).toMatchObject({ winning: 'automobile', amount: 200 });
  });

  it('should not place a bid when already winning', function() {
    expect(() => this.dispatch(placeBid('top-hat', 200)))
      .toThrow(MonopolyError, /winning/);
    expect(this.state.auction).toMatchObject({ winning: 'top-hat', amount: 100 });
  });

  it('should not place a bid lower than the current bid', function() {
    expect(() => this.dispatch(placeBid('automobile', 50)))
      .toThrow(MonopolyError, /higher/);
    expect(this.state.auction).toMatchObject({ winning: 'top-hat', amount: 100 });
  });

  it('should not place a bid the player cannot afford', function() {
    expect(() => this.dispatch(placeBid('thimble', 200)))
      .toThrow(MonopolyError, /insufficient/i);
    expect(this.state.auction).toMatchObject({ winning: 'top-hat', amount: 100 });
  });

  it('should not place a bid when the player is not involved', function() {
    expect(() => this.dispatch(placeBid('iron', 200)))
      .toThrow(MonopolyError, /involved/);
    expect(this.state.auction).toMatchObject({ winning: 'top-hat', amount: 100 });
  });

  it('should create a notice', function() {
    expect(this.state.notice.id).toBe('auction.bid');
    expect(this.state.notice.message).toMatch('bid');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('property.id', 'oriental-avenue');
    expect(this.state.notice.meta).toHaveProperty('amount', 100);
  });

  describe('with no current auction', () => {
    modifyGameInTesting({ state: { auction: false }});

    it('should not place a bid', function() {
      expect(() => this.dispatch(placeBid('top-hat', 200)))
        .toThrow(MonopolyError, /auction/);
    });
  });
});
