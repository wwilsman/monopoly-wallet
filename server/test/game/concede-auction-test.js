import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { concedeAuction } from '../../src/actions/auction';

describe('Game: conceding from auctions', function() {
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
    expect(this.state.auction.players).to.not.include('top-hat');
    expect(this.state.auction.players).to.include('automobile');
  });

  it('should cancel the auction when all players concede', function() {
    this.dispatch(concedeAuction('automobile'));
    expect(this.state.auction).to.be.false;
  });

  it('should create a notice', function() {
    expect(this.state.notice.id).to.equal('auction.conceded');
    expect(this.state.notice.message).to.match(/conceded/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
  });

  it('should create a different notice when the auction is cancelled', function() {
    this.dispatch(concedeAuction('automobile'));
    expect(this.state.notice.id).to.equal('auction.cancelled');
    expect(this.state.notice.message).to.match(/cancelled/);
    expect(this.state.notice.meta).to.have.property('property')
      .that.has.property('id', 'oriental-avenue');
  });

  describe('when winning', function() {
    modifyGameInTesting({ state: {
      auction: {
        winning: 'top-hat',
        amount: 50
      }
    }});

    it('should not remove the winning player', function() {
      expect(() => this.dispatch(concedeAuction('top-hat')))
        .to.throw(MonopolyError, /winning/);
      expect(this.state.auction.players).to.include('top-hat');
      expect(this.state.auction.players).to.include('automobile');
    });
  });

  describe('with no auction', function() {
    modifyGameInTesting({ state: { auction: false }});

    it('should throw an error', function() {
      expect(() => this.dispatch(concedeAuction('top-hat')))
        .to.throw(MonopolyError, /no/i);
    });
  });
});
