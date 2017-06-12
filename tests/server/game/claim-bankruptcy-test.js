import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { bankrupt } from '../../../server/actions/players';

describe('Game: claiming bankruptcy', function() {
  setupGameForTesting({ state: {
    players: [
      { id: 'player-1' },
      { id: 'player-2' }
    ],
    properties: [{
      id: 'oriental-avenue',
      owner: 'player-1',
      mortgaged: true
    }]
  }});

  it('should bankrupt the player', function() {
    this.dispatch(bankrupt('player-1'));

    expect(this.getPlayer('player-1')).to.deep.include({ bankrupt: true, balance: 0 });
    expect(this.getProperty('oriental-avenue').owner).to.equal('bank');
  });

  it('should transfer properties and remaining balance to another player', function() {
    this.dispatch(bankrupt('player-1', 'player-2'));

    expect(this.getPlayer('player-1')).to.deep.include({ bankrupt: true, balance: 0 });
    expect(this.getProperty('oriental-avenue').owner).to.equal('player-2');
    expect(this.getPlayer('player-2').balance).to.equal(3000);
  });

  describe('with improved properties', function() {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'st-james-place',
        owner: 'player-1',
        buildings: 1
      }]
    }});

    it('should not bankrupt the player', function() {
      expect(() => this.dispatch(bankrupt('player-1')))
        .to.throw(MonopolyError, /improved/);
      expect(this.getPlayer('player-1').bankrupt).to.be.false;
      expect(this.getProperty('st-james-place').owner).to.equal('player-1');
    });
  });

  describe('with unmortgaged properties', function() {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'orange',
        owner: 'player-1'
      }]
    }});

    it('should not bankrupt the player', function() {
      expect(() => this.dispatch(bankrupt('player-1')))
        .to.throw(MonopolyError, /unmortgaged/);
      expect(this.getPlayer('player-1').bankrupt).to.be.false;
      expect(this.getProperty('st-james-place').owner).to.equal('player-1');
    });
  });
});
