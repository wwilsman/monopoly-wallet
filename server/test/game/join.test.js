import expect from 'expect';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { join } from '../../src/actions/players';

describe('Game: joining', () => {
  setupGameForTesting({ state: { bank: 3000 }});

  beforeEach(function() {
    this.dispatch(join('Player 1', 'top-hat'));
  });

  it('should add the player to the state', function() {
    expect(this.state.players['top-hat']).toEqual({
      name: 'Player 1',
      token: 'top-hat',
      balance: 1500,
      bankrupt: false
    });
  });

  it('should subtract the starting balance from the bank', function() {
    expect(this.state.bank).toBe(this.last.bank - this.config.playerStart);
  });

  it('should not add a player with the same token', function() {
    expect(() => this.dispatch(join('Player 2', 'top-hat')))
      .toThrow(MonopolyError, /in use/);
    expect(this.state.players['top-hat']).toHaveProperty('name', 'Player 1');
  });

  it('should not add a player with an invalid token', function() {
    expect(() => this.dispatch(join('Player 2', 'fake-token')))
      .toThrow(MonopolyError, /invalid/i);
    expect(this.state.players['fake-token']).toBeUndefined();
  });

  it('should create a notice', function() {
    expect(this.state.notice.id).toBe('player.joined');
    expect(this.state.notice.message).toMatch('joined');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
  });

  describe('when the bank has low funds', () => {
    modifyGameInTesting({ state: { bank: 0 }});

    it('should not add a player', function() {
      expect(() => this.dispatch(join('Player 2', 'automobile')))
        .toThrow(MonopolyError, /insufficient/);
      expect(this.state.players).not.toHaveProperty('automobile');
    });
  });

  describe('with a custom starting balance', () => {
    modifyGameInTesting({ config: { playerStart: 10 }});

    it('should start the player with the correct balance', function() {
      this.dispatch(join('Player 1', 'top-hat'));
      expect(this.state.players['top-hat']).toHaveProperty('balance', 10);
    });
  });
});
