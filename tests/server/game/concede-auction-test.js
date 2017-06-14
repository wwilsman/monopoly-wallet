import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { concedeAuction } from '../../../server/actions/auction';

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

  it('should remove the player from the auction', function() {
    this.dispatch(concedeAuction('top-hat'));
    expect(this.state.auction.players).to.not.include('top-hat');
    expect(this.state.auction.players).to.include('automobile');
  });

  it('should cancel the auction when all players concede', function() {
    this.dispatch(concedeAuction('top-hat'));
    this.dispatch(concedeAuction('automobile'));
    expect(this.state.auction).to.be.false;
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
});
