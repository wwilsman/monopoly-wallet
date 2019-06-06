import expect from 'expect';

import { setupGameForTesting } from './helpers';

import MonopolyError from '../../src/error';
import { auctionProperty } from '../../src/actions/auction';

describe('Game: auctioning properties', () => {
  setupGameForTesting({ state: {
    players: [
      { token: 'top-hat' },
      { token: 'automobile' }
    ],
    properties: [{
      id: 'st-james-place',
      owner: 'automobile'
    }]
  }});

  it('should put the property up for auction', function() {
    this.dispatch(auctionProperty('top-hat', 'oriental-avenue'));

    expect(this.state.auction).toEqual({
      property: 'oriental-avenue',
      players: ['top-hat', 'automobile'],
      winning: false,
      amount: 0
    });
  });

  it('should not put owned properties up for auction', function() {
    expect(() => this.dispatch(auctionProperty('top-hat', 'st-james-place')))
      .toThrow(MonopolyError, /owned/);
    expect(this.state.auction).toBe(false);
  });

  it('should not auction multiple properties', function() {
    this.dispatch(auctionProperty('top-hat', 'oriental-avenue'));

    expect(() => this.dispatch(auctionProperty('top-hat', 'connecticut-avenue')))
      .toThrow(MonopolyError, /auction/i);
    expect(this.state.auction.property).toBe('oriental-avenue');
  });

  it('should create a notice', function() {
    this.dispatch(auctionProperty('top-hat', 'oriental-avenue'));

    expect(this.state.notice.id).toBe('auction.start');
    expect(this.state.notice.message).toMatch('auction');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('property.id', 'oriental-avenue');
  });
});
