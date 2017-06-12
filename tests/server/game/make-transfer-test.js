import { describe, it } from 'mocha';
import { expect } from 'chai';

import { setupGameForTesting } from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { makeTransfer } from '../../../server/actions/players';

describe('Game: making transfers', function() {
  setupGameForTesting({ state: {
    bank: 100,
    players: [{
      id: 'player-1',
      balance: 100
    }, {
      id: 'player-2',
      balance: 100
    }]
  }});

  it('should transfer money from the bank to the player', function() {
    this.dispatch(makeTransfer('player-1', 100));

    expect(this.getPlayer('player-1').balance).to.equal(200);
    expect(this.state.bank).to.equal(0);
  });

  it('should transfer money from the player to the bank', function() {
    this.dispatch(makeTransfer('player-1', -100));

    expect(this.getPlayer('player-1').balance).to.equal(0);
    expect(this.state.bank).to.equal(200);
  });

  it('should not transfer money from the bank with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('player-1', 200)))
      .to.throw(MonopolyError, /insufficient/);
    expect(this.getPlayer('player-1').balance).to.equal(100);
    expect(this.state.bank).to.equal(100);
  });

  it('should not transfer money from the player with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('player-1', -200)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.getPlayer('player-1').balance).to.equal(100);
    expect(this.state.bank).to.equal(100);
  });

  it('should transfer money to another player', function() {
    this.dispatch(makeTransfer('player-1', 'player-2', 100));

    expect(this.getPlayer('player-1').balance).to.equal(0);
    expect(this.getPlayer('player-2').balance).to.equal(200);
  });

  it('should not transfer money from another player', function() {
    expect(() => this.dispatch(makeTransfer('player-1', 'player-2', -100)))
      .to.throw(MonopolyError, /negative/);
    expect(this.getPlayer('player-1').balance).to.equal(100);
    expect(this.getPlayer('player-2').balance).to.equal(100);
  });

  it('should not transfer with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('player-1', 'player-2', 200)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.getPlayer('player-1').balance).to.equal(100);
    expect(this.getPlayer('player-2').balance).to.equal(100);
  });
});
