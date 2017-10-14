import { describe, it } from 'mocha';
import { expect } from 'chai';

import { setupGameForTesting } from '../game-helpers';

import MonopolyError from '../../../server/error';
import { makeTransfer } from '../../../server/actions/players';

describe('Game: making transfers', function() {
  setupGameForTesting({ state: {
    bank: 100,
    players: [{
      token: 'top-hat',
      balance: 100
    }, {
      token: 'automobile',
      balance: 100
    }]
  }});

  it('should transfer money from the bank to the player', function() {
    this.dispatch(makeTransfer('top-hat', -100));

    expect(this.getPlayer('top-hat').balance).to.equal(200);
    expect(this.state.bank).to.equal(0);
  });

  it('should transfer money from the player to the bank', function() {
    this.dispatch(makeTransfer('top-hat', 100));

    expect(this.getPlayer('top-hat').balance).to.equal(0);
    expect(this.state.bank).to.equal(200);
  });

  it('should not transfer money from a non-existent player', function() {
    expect(() => this.dispatch(makeTransfer('thimble')))
      .to.throw(MonopolyError, /player/);
    expect(this.state.bank).to.equal(100);
  });

  it('should not transfer money from the bank with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('top-hat', 200)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.getPlayer('top-hat').balance).to.equal(100);
    expect(this.state.bank).to.equal(100);
  });

  it('should not transfer money from the player with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('top-hat', -200)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.getPlayer('top-hat').balance).to.equal(100);
    expect(this.state.bank).to.equal(100);
  });

  it('should transfer money to another player', function() {
    this.dispatch(makeTransfer('top-hat', 'automobile', 100));

    expect(this.getPlayer('top-hat').balance).to.equal(0);
    expect(this.getPlayer('automobile').balance).to.equal(200);
  });

  it('should not transfer money to a non-existent player', function() {
    expect(() => this.dispatch(makeTransfer('top-hat', 'thimble', 100)))
      .to.throw(MonopolyError, /player/);
    expect(this.getPlayer('top-hat').balance).to.equal(100);
  });

  it('should not transfer money from another player', function() {
    expect(() => this.dispatch(makeTransfer('top-hat', 'automobile', -100)))
      .to.throw(MonopolyError, /negative/);
    expect(this.getPlayer('top-hat').balance).to.equal(100);
    expect(this.getPlayer('automobile').balance).to.equal(100);
  });

  it('should not transfer with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('top-hat', 'automobile', 200)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.getPlayer('top-hat').balance).to.equal(100);
    expect(this.getPlayer('automobile').balance).to.equal(100);
  });

  it('should create a notice about paying the bank', function() {
    this.dispatch(makeTransfer('top-hat', 100));

    expect(this.state.notice.id).to.equal('player.paid-amount');
    expect(this.state.notice.message).to.match(/paid the bank/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
    expect(this.state.notice.meta).to.have.property('amount', 100);
  });

  it('should create a notice about receiving money', function() {
    this.dispatch(makeTransfer('top-hat', -100));

    expect(this.state.notice.id).to.equal('player.received-amount');
    expect(this.state.notice.message).to.match(/received/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
    expect(this.state.notice.meta).to.have.property('amount', 100);
  });

  it('should create a notice about paying another player', function() {
    this.dispatch(makeTransfer('top-hat', 'automobile', 100));

    expect(this.state.notice.id).to.equal('player.paid-other');
    expect(this.state.notice.message).to.match(/paid/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
    expect(this.state.notice.meta).to.have.property('other')
      .that.has.property('token', 'automobile');
    expect(this.state.notice.meta).to.have.property('amount', 100);
  });
});
