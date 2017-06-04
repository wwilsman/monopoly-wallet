import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';

import { expect } from 'chai';

import createGame from './game';
import MonopolyError from './rules/error';
import { join, buyProperty } from './actions';

const GAME = {
  bank: 1500,
  players: [{
    id: 'name-namerson-top-hat',
    name: 'Name Namerson',
    token: 'top-hat',
    balance: 1500
  }],
  properties: [{
    id: 'oriental-avenue',
    name: 'Oriental Avenue',
    group: 'light-blue',
    rent: [6, 30, 90, 270, 400, 550],
    buildings: 0,
    price: 100
  }]
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
      expect(state.players[0].name).to.equal('Player 1');
      expect(state.players[0].token).to.equal('top-hat');
      expect(state.players.length).to.equal(2);
    });

    it('should give the player a starting balance', function() {
      expect(state.players[1].balance).to.equal(CONFIG.playerStart);
    });

    it('should subtract the start balance from the bank', function() {
      expect(state.bank).to.equal(GAME.bank - CONFIG.playerStart);
    });

    it('should not add a player with the same token', function() {
      expect(() => store.dispatch(join('Player 2', 'top-hat')))
        .to.throw(MonopolyError, /in use/);
      expect(state.players.length).to.equal(2);
    });

    it('should not add a player when the bank has insufficient funds', function() {
      expect(() => store.dispatch(join('Player 2', 'automobile')))
        .to.throw(MonopolyError, /insufficient/);
      expect(state.players.length).to.equal(2);
    });
  });

  describe('buyProperty', function() {
    const player = GAME.players[0];
    const property = GAME.properties[0];

    it('should buy the property for the player', function() {
      store.dispatch(buyProperty(player.id, property.id));

      expect(state.properties[0].owner).to.equal(player.id);
      expect(state.players[0].balance).to.equal(player.balance - property.price);
      expect(state.bank).to.equal(GAME.bank + property.price);
    });

    it('should buy the property for a specific price', function() {
      const price = 10;

      store.dispatch(buyProperty(player.id, property.id, price));

      expect(state.properties[0].owner).to.equal(player.id);
      expect(state.players[0].balance).to.equal(player.balance - price);
      expect(state.bank).to.equal(GAME.bank + price);
    });

    it('should not buy the property when already owned', function() {
      const player2 = {
        id: 'player-2-automobile',
        name: 'Player 2',
        token: 'automobile'
      };

      store.dispatch(join(player2.name, player2.token));
      store.dispatch(buyProperty(player.id, property.id));

      expect(() => store.dispatch(buyProperty(player2.id, property.id)))
        .to.throw(MonopolyError, /owned/);
      expect(state.properties[0].owner).to.equal(player.id);
    });

    it('should not buy the property with an insufficient balance', function() {
      expect(() => store.dispatch(buyProperty(player.id, property.id, player.balance + 1)))
        .to.throw(MonopolyError, /insufficient/i);
      expect(state.properties[0].owner).to.not.equal(player.id);
    });
  });
});
