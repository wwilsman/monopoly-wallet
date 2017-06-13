import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { join } from '../../../server/actions/players';

describe('Game: joining', function() {
  setupGameForTesting({ state: { bank: 3000 }});

  beforeEach(function() {
    this.dispatch(join('Player 1', 'top-hat'));
  });

  it('should add the player to the state', function() {
    expect(this.state.players['top-hat']).to.deep.equal({
      name: 'Player 1',
      token: 'top-hat',
      balance: 1500,
      bankrupt: false
    });
  });

  it('should subtract the starting balance from the bank', function() {
    expect(this.state.bank).to.equal(this.last.bank - this.config.playerStart);
  });

  it('should not add a player with the same token', function() {
    expect(() => this.dispatch(join('Player 2', 'top-hat')))
      .to.throw(MonopolyError, /in use/);
    expect(this.state.players['top-hat'].name).to.equal('Player 1');
  });

  describe('when the bank has low funds', function() {
    modifyGameInTesting({ state: { bank: 0 }});

    it('should not add a player', function() {
      expect(() => this.dispatch(join('Player 2', 'automobile')))
        .to.throw(MonopolyError, /insufficient/);
      expect(this.state.players).to.not.have.property('automobile');
    });
  });

  describe('with a custom starting balance', function() {
    modifyGameInTesting({ config: { playerStart: 10 }});

    it('should start the player with the correct balance', function() {
      this.dispatch(join('Player 1', 'top-hat'));
      expect(this.state.players['top-hat'].balance).to.equal(10);
    });
  });
});
