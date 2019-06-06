import expect from 'expect';

import { setupGameForTesting } from './helpers';

import MonopolyError from '../../src/error';
import { makeTransfer } from '../../src/actions/players';

describe('Game: making transfers', () => {
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

    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 200);
    expect(this.state.bank).toBe(0);
  });

  it('should transfer money from the player to the bank', function() {
    this.dispatch(makeTransfer('top-hat', 100));

    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 0);
    expect(this.state.bank).toBe(200);
  });

  it('should not transfer money from a non-existent player', function() {
    expect(() => this.dispatch(makeTransfer('thimble')))
      .toThrow(MonopolyError, /player/);
    expect(this.state.bank).toBe(100);
  });

  it('should not transfer money from the bank with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('top-hat', 200)))
      .toThrow(MonopolyError, /insufficient/i);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 100);
    expect(this.state.bank).toBe(100);
  });

  it('should not transfer money from the player with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('top-hat', -200)))
      .toThrow(MonopolyError, /insufficient/i);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 100);
    expect(this.state.bank).toBe(100);
  });

  it('should transfer money to another player', function() {
    this.dispatch(makeTransfer('top-hat', 'automobile', 100));

    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 0);
    expect(this.getPlayer('automobile')).toHaveProperty('balance', 200);
  });

  it('should not transfer money to a non-existent player', function() {
    expect(() => this.dispatch(makeTransfer('top-hat', 'thimble', 100)))
      .toThrow(MonopolyError, /player/);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 100);
  });

  it('should not transfer money from another player', function() {
    expect(() => this.dispatch(makeTransfer('top-hat', 'automobile', -100)))
      .toThrow(MonopolyError, /negative/);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 100);
    expect(this.getPlayer('automobile')).toHaveProperty('balance', 100);
  });

  it('should not transfer with insufficient funds', function() {
    expect(() => this.dispatch(makeTransfer('top-hat', 'automobile', 200)))
      .toThrow(MonopolyError, /insufficient/i);
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 100);
    expect(this.getPlayer('automobile')).toHaveProperty('balance', 100);
  });

  it('should create a notice about paying the bank', function() {
    this.dispatch(makeTransfer('top-hat', 100));

    expect(this.state.notice.id).toBe('player.paid-amount');
    expect(this.state.notice.message).toMatch('paid the bank');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('amount', 100);
  });

  it('should create a notice about receiving money', function() {
    this.dispatch(makeTransfer('top-hat', -100));

    expect(this.state.notice.id).toBe('player.received-amount');
    expect(this.state.notice.message).toMatch('received');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('amount', 100);
  });

  it('should create a notice about paying another player', function() {
    this.dispatch(makeTransfer('top-hat', 'automobile', 100));

    expect(this.state.notice.id).toBe('player.paid-other');
    expect(this.state.notice.message).toMatch('paid');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('other.token', 'automobile');
    expect(this.state.notice.meta).toHaveProperty('amount', 100);
  });
});
