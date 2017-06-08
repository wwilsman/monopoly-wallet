import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { makeTransfer } from '../../../server/actions';

describe('Game: making transfers', function() {
  setupGameForTesting({ state: {
    bank: 100,
    players: [{
      id: 'p1',
      name: 'Player 1',
      token: 'top-hat',
      balance: 100
    }, {
      id: 'p2',
      name: 'Player 2',
      token: 'automobile',
      balance: 100
    }]
  }});

  it('should transfer money from the bank to the player', function() {
    this.dispatch(makeTransfer('p1', 100));

    expect(this.getPlayer('p1').balance).to.equal(200);
    expect(this.state.bank).to.equal(0);
  });

  it('should transfer money from the player to the bank', function() {
    this.dispatch(makeTransfer('p1', -100));

    expect(this.getPlayer('p1').balance).to.equal(0);
    expect(this.state.bank).to.equal(200);
  });

  it('should not transfer money from the bank with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('p1', 200)))
      .to.throw(MonopolyError, /insufficient/);
    expect(this.getPlayer('p1').balance).to.equal(100);
    expect(this.state.bank).to.equal(100);
  });

  it('should not transfer money from the player with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('p1', -200)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.getPlayer('p1').balance).to.equal(100);
    expect(this.state.bank).to.equal(100);
  });

  it('should transfer money to another player', function() {
    this.dispatch(makeTransfer('p1', 'p2', 100));

    expect(this.getPlayer('p1').balance).to.equal(0);
    expect(this.getPlayer('p2').balance).to.equal(200);
  });

  it('should not transfer money from another player', function() {
    expect(() => this.dispatch(makeTransfer('p1', 'p2', -100)))
      .to.throw(MonopolyError, /negative/);
    expect(this.getPlayer('p1').balance).to.equal(100);
    expect(this.getPlayer('p2').balance).to.equal(100);
  });

  it('should not transfer with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('p1', 'p2', 200)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.getPlayer('p1').balance).to.equal(100);
    expect(this.getPlayer('p2').balance).to.equal(100);
  });
});
