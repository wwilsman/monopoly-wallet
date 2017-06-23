import { describe, it } from 'mocha';
import { expect } from 'chai';

import { setupGameForTesting } from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { auctionProperty } from '../../../server/actions/auction';

describe('Game: auctioning properties', function() {
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

    expect(this.state.auction).to.deep.equal({
      property: 'oriental-avenue',
      players: ['top-hat', 'automobile'],
      winning: false,
      amount: 0
    });
  });

  it('should not put owned properties up for auction', function() {
    expect(() => this.dispatch(auctionProperty('top-hat', 'st-james-place')))
      .to.throw(MonopolyError, /owned/);
    expect(this.state.auction).to.be.false;
  });

  it('should not auction multiple properties', function() {
    this.dispatch(auctionProperty('top-hat', 'oriental-avenue'));

    expect(() => this.dispatch(auctionProperty('top-hat', 'connecticut-avenue')))
      .to.throw(MonopolyError, /auction/i);
    expect(this.state.auction.property).to.equal('oriental-avenue');
  });

  it('should create a notice', function() {
    this.dispatch(auctionProperty('top-hat', 'oriental-avenue'));

    expect(this.state.notice.id).to.equal('auction.start');
    expect(this.state.notice.message).to.match(/auction/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
    expect(this.state.notice.meta).to.have.property('property')
      .that.has.property('id', 'oriental-avenue');
  });
});
