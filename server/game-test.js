import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';

import { expect } from 'chai';

import createGame from './game';
import MonopolyError from './rules/error';
import { join } from './actions';

const GAME = {
  bank: 1500,
  players: []
};

const CONFIG = {
  playerStart: 1500
};

describe('Game', function() {
  let store, state;

  beforeEach(function() {
    store = createGame(GAME, CONFIG);
    state = store.getState();

    this.unsubscribe = store.subscribe(() => {
      state = store.getState();
    });
  });

  afterEach(function() {
    this.unsubscribe();
    store = null;
  });

  describe('creation', function() {
    it('should create a new store', function() {
      expect(store).to.be.ok;
    });
  });

  describe('join', function() {
    beforeEach(function() {
      store.dispatch(join('Player 1', 'top-hat'));
    });

    it('should add the player to the state', function() {
      expect(state.players.length).to.equal(1);
      expect(state.players[0].name).to.equal('Player 1');
      expect(state.players[0].token).to.equal('top-hat');
    });

    it('should give the player a starting balance', function() {
      expect(state.players[0].balance).to.equal(CONFIG.playerStart);
    });

    it('should subtract the start balance from the bank', function() {
      expect(state.bank).to.equal(GAME.bank - CONFIG.playerStart);
    });

    it('should not add a player with the same token', function() {
      expect(() => store.dispatch(join('Player 2', 'top-hat')))
        .to.throw(MonopolyError, /in use/);
      expect(state.players.length).to.equal(1);
    });

    it('should not add a player when the bank has insufficient funds', function() {
      expect(() => store.dispatch(join('Player 2', 'automobile')))
        .to.throw(MonopolyError, /insufficient/);
      expect(state.players.length).to.equal(1);
    });
  });
});
