import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../game-helpers';

import MonopolyError from '../../../server/error';
import { placeBid } from '../../../server/actions/auction';

describe('Game: bidding in auctions', function() {
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
    expect(this.state.auction).to.deep.include({ winning: 'top-hat', amount: 100 });
  });

  it('should place a bid higher than the current bid', function() {
    this.dispatch(placeBid('automobile', 200));
    expect(this.state.auction).to.deep.include({ winning: 'automobile', amount: 200 });
  });

  it('should not place a bid when already winning', function() {
    expect(() => this.dispatch(placeBid('top-hat', 200)))
      .to.throw(MonopolyError, /winning/);
    expect(this.state.auction).to.deep.include({ winning: 'top-hat', amount: 100 });
  });

  it('should not place a bid lower than the current bid', function() {
    expect(() => this.dispatch(placeBid('automobile', 50)))
      .to.throw(MonopolyError, /higher/);
    expect(this.state.auction).to.deep.include({ winning: 'top-hat', amount: 100 });
  });

  it('should not place a bid the player cannot afford', function() {
    expect(() => this.dispatch(placeBid('thimble', 200)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.state.auction).to.deep.include({ winning: 'top-hat', amount: 100 });
  });

  it('should not place a bid when the player is not involved', function() {
    expect(() => this.dispatch(placeBid('iron', 200)))
      .to.throw(MonopolyError, /involved/);
    expect(this.state.auction).to.deep.include({ winning: 'top-hat', amount: 100 });
  });

  it('should create a notice', function() {
    expect(this.state.notice.id).to.equal('auction.bid');
    expect(this.state.notice.message).to.match(/bid/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
    expect(this.state.notice.meta).to.have.property('property')
      .that.has.property('id', 'oriental-avenue');
    expect(this.state.notice.meta).to.have.property('amount', 100);
  });

  describe('with no current auction', function() {
    modifyGameInTesting({ state: { auction: false }});

    it('should not place a bid', function() {
      expect(() => this.dispatch(placeBid('top-hat', 200)))
        .to.throw(MonopolyError, /auction/);
    });
  });
});
