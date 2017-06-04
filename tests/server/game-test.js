import {
  describe,
  beforeEach,
  it
} from 'mocha';

import { expect } from 'chai';
import { setupGame } from './helpers';

import MonopolyError from '../../server/rules/error';
import { join, buyProperty } from '../../server/actions';

describe('Game Actions', function() {
  describe('join()', function() {
    setupGame({ state: { bank: 1500 }});

    const player = {
      name: 'Name Namerson',
      token: 'top-hat'
    };

    beforeEach(function() {
      this.dispatch(join(player.name, player.token));
    });

    it('should add the player to the state', function() {
      expect(this.state.players).to.have.lengthOf(1);
      expect(this.state.players[0].name).to.equal(player.name);
      expect(this.state.players[0].token).to.equal(player.token);
      expect(this.state.players[0].balance).to.be.ok;
      expect(this.state.players[0].id).to.be.ok;
    });

    it('should not add a player with the same token', function() {
      expect(() => this.dispatch(join('Another Player', player.token)))
        .to.throw(MonopolyError, /in use/);
      expect(this.state.players).to.have.lengthOf(1);
    });

    it('should not add a player when the bank has insufficient funds', function() {
      expect(() => this.dispatch(join('Another Player', 'automobile')))
        .to.throw(MonopolyError, /insufficient/);
      expect(this.state.players).to.have.lengthOf(1);
    });

    describe('with a custom start balance', function() {
      setupGame({ config: { playerStart: 10 }});

      beforeEach(function() {
        this.dispatch(join(player.name, player.token));
      });

      it('should start the player with a custom balance', function() {
        expect(this.state.players[0].balance).to.equal(this.config.playerStart);
      });

      it('should subtract the start balance from the bank', function() {
        expect(this.state.bank).to.equal(this.last.bank - this.config.playerStart);
      });
    });
  });

  describe('buyProperty()', function() {
    let player, property;

    setupGame({ state: {
      players: [{
        id: 'player-1',
        name: 'Player 1',
        token: 'top-hat',
        balance: 1500
      }]
    }});

    beforeEach(function() {
      player = this.state.players[0];
      property = this.state.properties[0];
    });

    it('should buy the property for the player', function() {
      this.dispatch(buyProperty(player.id, property.id));

      expect(this.state.properties[0].owner).to.equal(player.id);
      expect(this.state.players[0].balance).to.equal(player.balance - property.price);
      expect(this.state.bank).to.equal(this.last.bank + property.price);
    });

    it('should buy the property for a specific price', function() {
      this.dispatch(buyProperty(player.id, property.id, 10));

      expect(this.state.properties[0].owner).to.equal(player.id);
      expect(this.state.players[0].balance).to.equal(player.balance - 10);
      expect(this.state.bank).to.equal(this.last.bank + 10);
    });

    it('should not buy the property when already owned', function() {
      this.dispatch(join('Player 2', 'automobile'));
      this.dispatch(buyProperty(player.id, property.id));

      const player2 = this.state.players[1];

      expect(() => this.dispatch(buyProperty(player2.id, property.id)))
        .to.throw(MonopolyError, /owned/);
      expect(this.state.properties[0].owner).to.equal(player.id);
    });

    it('should not buy the property with insufficient funds', function() {
      expect(() => this.dispatch(buyProperty(player.id, property.id, player.balance + 1)))
        .to.throw(MonopolyError, /insufficient/i);
      expect(this.state.properties[0].owner).to.not.equal(player.id);
    });
  });
});
