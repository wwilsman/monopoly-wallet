import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../game-helpers';

import MonopolyError from '../../../server/error';
import { closeAuction } from '../../../server/actions/auction';

describe('Game: closing auctions', function() {
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

    expect(this.state.auction).to.be.false;
    expect(this.getPlayer('top-hat').balance).to.equal(1500);
    expect(this.getProperty('oriental-avenue').owner).to.equal('bank');
  });

  it('should create a notice', function() {
    this.dispatch(closeAuction());

    expect(this.state.notice.id).to.equal('auction.cancelled');
    expect(this.state.notice.message).to.match(/cancelled/);
    expect(this.state.notice.meta).to.have.property('property')
      .that.has.property('id', 'oriental-avenue');
  });

  describe('when winning the auction', function() {
    modifyGameInTesting({ state: {
      auction: {
        winning: 'top-hat',
        amount: 100
      }
    }});

    it('should buy the property at the bid amount', function() {
      this.dispatch(closeAuction());

      expect(this.state.auction).to.be.false;
      expect(this.getPlayer('top-hat').balance).to.equal(1400);
      expect(this.getProperty('oriental-avenue').owner).to.equal('top-hat');
      expect(this.state.bank).to.equal(200);
    });

    it('should create a different notice', function() {
      this.dispatch(closeAuction());

      expect(this.state.notice.id).to.equal('auction.won');
      expect(this.state.notice.message).to.match(/won .* at auction/);
      expect(this.state.notice.meta).to.have.property('player')
        .that.has.property('token', 'top-hat');
      expect(this.state.notice.meta).to.have.property('property')
        .that.has.property('id', 'oriental-avenue');
      expect(this.state.notice.meta).to.have.property('amount', 100);
    });
  });

  describe('when winning with a low balance', function() {
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
        .to.throw(MonopolyError, /insufficient/i);
      expect(this.state.auction).to.be.ok;
    });
  });

  describe('when there is no auction', function() {
    modifyGameInTesting({ state: { auction: false }});

    it('should throw an error', function() {
      expect(() => this.dispatch(closeAuction()))
        .to.throw(MonopolyError, /no/i);
    });
  });
});
