import expect from 'expect';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { claimBankruptcy } from '../../src/actions/players';

describe('Game: claiming bankruptcy', () => {
  setupGameForTesting({ state: {
    players: [
      { token: 'top-hat' },
      { token: 'automobile' }
    ],
    properties: [{
      id: 'oriental-avenue',
      owner: 'top-hat',
      mortgaged: true
    }]
  }});

  it('should bankrupt the player', function() {
    this.dispatch(claimBankruptcy('top-hat'));

    expect(this.getPlayer('top-hat')).toMatchObject({ bankrupt: true, balance: 0 });
    expect(this.getProperty('oriental-avenue')).toHaveProperty('owner', 'bank');
  });

  it('should transfer properties and remaining balance to another player', function() {
    this.dispatch(claimBankruptcy('top-hat', 'automobile'));

    expect(this.getPlayer('top-hat')).toMatchObject({ bankrupt: true, balance: 0 });
    expect(this.getProperty('oriental-avenue')).toHaveProperty('owner', 'automobile');
    expect(this.getPlayer('automobile')).toHaveProperty('balance', 3000);
  });

  it('should create a notice', function() {
    this.dispatch(claimBankruptcy('top-hat'));

    expect(this.state.notice.id).toBe('player.bankrupt');
    expect(this.state.notice.message).toMatch('went bankrupt');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
  });

  it('should create a different notice when bankrupt by another player', function() {
    this.dispatch(claimBankruptcy('top-hat', 'automobile'));

    expect(this.state.notice.id).toBe('player.other-bankrupt');
    expect(this.state.notice.message).toMatch('bankrupt');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('other.token', 'automobile');
  });

  describe('with improved properties', () => {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'st-james-place',
        owner: 'top-hat',
        buildings: 1
      }]
    }});

    it('should not bankrupt the player', function() {
      expect(() => this.dispatch(claimBankruptcy('top-hat')))
        .toThrow(MonopolyError, /improved/);
      expect(this.getPlayer('top-hat')).toHaveProperty('bankrupt', false);
      expect(this.getProperty('st-james-place')).toHaveProperty('owner', 'top-hat');
    });
  });

  describe('with unmortgaged properties', () => {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'orange',
        owner: 'top-hat'
      }]
    }});

    it('should not bankrupt the player', function() {
      expect(() => this.dispatch(claimBankruptcy('top-hat')))
        .toThrow(MonopolyError, /unmortgaged/);
      expect(this.getPlayer('top-hat')).toHaveProperty('bankrupt', false);
      expect(this.getProperty('st-james-place')).toHaveProperty('owner', 'top-hat');
    });
  });
});
