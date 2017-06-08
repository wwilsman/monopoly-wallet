import {
  describe,
  beforeEach,
  it
} from 'mocha';
import {
  expect
} from 'chai';
import {
  setupGameForTesting,
  modifyGameForTesting
} from './test-helpers';

import MonopolyError from '../../server/rules/error';
import {
  join,
  buyProperty,
  makeTransfer,
  improveProperty
} from '../../server/actions';

describe('Game Actions', function() {
  describe('join()', function() {
    setupGameForTesting({ state: { bank: 1500 }});

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
      expect(this.state.players[0].balance).to.equal(this.config.playerStart);
      expect(this.state.players[0].id).to.equal('name-namerson_top-hat');
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
      modifyGameForTesting({ config: { playerStart: 10 }});

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

    setupGameForTesting({ state: {
      players: [{
        name: 'Player 1',
        token: 'top-hat'
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

    it('should not buy the property for a negative price', function() {
      expect(() => this.dispatch(buyProperty(player.id, property.id, -10)))
        .to.throw(MonopolyError, /negative/);
      expect(this.state.properties[0].owner).to.not.equal(player.id);
    });

    it('should not buy the property when already owned', function() {
      this.dispatch(buyProperty(player.id, property.id));
      this.dispatch(join('Player 2', 'automobile'));
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

  describe('makeTransfer()', function() {
    let player;

    setupGameForTesting({ state: {
      bank: 100,
      players: [{
        name: 'Player 1',
        token: 'top-hat',
        balance: 100
      }]
    }});

    beforeEach(function() {
      player = this.state.players[0];
    });

    it('should transfer money from the bank to the player', function() {
      this.dispatch(makeTransfer(player.id, 100));

      expect(this.state.players[0].balance).to.equal(player.balance + 100);
      expect(this.state.bank).to.equal(this.last.bank - 100);
    });

    it('should transfer money from the player to the bank', function() {
      this.dispatch(makeTransfer(player.id, -100));

      expect(this.state.players[0].balance).to.equal(player.balance - 100);
      expect(this.state.bank).to.equal(this.last.bank + 100);
    });

    it('should not transfer money from the bank with insufficient funds', function() {
      expect(() => this.dispatch(makeTransfer(player.id, 200)))
        .to.throw(MonopolyError, /insufficient/);
      expect(this.state.players[0].balance).to.equal(player.balance);
    });

    it('should not transfer money from the player with insufficient funds', function() {
      expect(() => this.dispatch(makeTransfer(player.id, -200)))
        .to.throw(MonopolyError, /insufficient/i);
      expect(this.state.players[0].balance).to.equal(player.balance);
    });

    describe('with another player', function() {
      let player2;

      modifyGameForTesting({ state: {
        players: [{
          name: 'Player 2',
          token: 'automobile',
          balance: 100
        }]
      }});

      beforeEach(function() {
        player2 = this.state.players[1];
      });

      it('should transfer money to another player', function() {
        this.dispatch(makeTransfer(player.id, player2.id, 100));

        expect(this.state.players[0].balance).to.equal(player.balance - 100);
        expect(this.state.players[1].balance).to.equal(player2.balance + 100);
      });

      it('should not transfer a negative amount', function() {
        expect(() => this.dispatch(makeTransfer(player.id, player2.id, -100)))
          .to.throw(MonopolyError, /negative/);
        expect(this.state.players[0].balance).to.equal(player.balance);
        expect(this.state.players[1].balance).to.equal(player2.balance);
      });

      it('should not transfer with insufficient funds', function() {
        expect(() => this.dispatch(makeTransfer(player.id, player2.id, 200)))
          .to.throw(MonopolyError, /insufficient/i);
        expect(this.state.players[0].balance).to.equal(player.balance);
        expect(this.state.players[1].balance).to.equal(player2.balance);
      });
    });
  });

  describe('improveProperty()', function() {
    let player, properties;

    setupGameForTesting({ state: {
      players: [{
        id: 'player-1',
        name: 'Player 1',
        token: 'top-hat',
        balance: 50
      }],
      properties: [{
        group: 'lightblue',
        owner: 'player-1'
      }]
    }});

    it('should add a house to the property', function() {
      const player = this.getPlayer('player-1');
      const property = this.getProperty('oriental-avenue');

      this.dispatch(improveProperty(player.id, property.id));

      expect(this.getPlayer(player.id).balance).to.equal(player.balance - property.cost);
      expect(this.state.bank).to.equal(this.last.bank + property.cost);
      expect(this.getProperty(property.id).buildings).to.equal(1);
      expect(this.state.houses).to.equal(this.last.houses - 1);
    });

    it('should not improve an unowned property', function() {
      expect(() => this.dispatch(improveProperty('player-1', 'mediterranean-avenue')))
        .to.throw(MonopolyError, /not own/i);
      expect(this.getProperty('mediterranean-avenue').buildings).to.equal(0);
    });

    it('should not improve with insufficient funds', function() {
      this.dispatch(improveProperty('player-1', 'oriental-avenue'));

      expect(this.getProperty('oriental-avenue').buildings).to.equal(1);

      expect(() => this.dispatch(improveProperty('player-1', 'connecticut-avenue')))
        .to.throw(MonopolyError, /insufficient/i);
      expect(this.getProperty('connecticut-avenue').buildings).to.equal(0);
    });

    describe('when a property is a railroad or utility', function() {
      modifyGameForTesting({ state: {
        properties: [{
          id: 'reading-railroad',
          owner: 'player-1'
        }, {
          id: 'electric-company',
          owner: 'player-1'
        }]
      }});

      it('should not improve a railroad', function() {
        expect(() => this.dispatch(improveProperty('player-1', 'reading-railroad')))
          .to.throw(MonopolyError, /improve a railroad/i);
        expect(this.getProperty('reading-railroad').buildings).to.equal(0);
      });

      it('should not improve a utility', function() {
        expect(() => this.dispatch(improveProperty('player-1', 'electric-company')))
          .to.throw(MonopolyError, /improve a utility/i);
        expect(this.getProperty('electric-company').buildings).to.equal(0);
      });
    });

    describe('when the player does not own the monopoly', function() {
      modifyGameForTesting({ state: {
        properties: [{
          id: 'connecticut-avenue',
          owner: 'bank'
        }]
      }});

      it('should not improve the property', function() {
        expect(() => this.dispatch(improveProperty('player-1', 'oriental-avenue')))
          .to.throw(MonopolyError, /monopoly/);
        expect(this.getProperty('oriental-avenue').buildings).to.equal(0);
      });
    });

    describe('when the property is mortgaged', function() {
      modifyGameForTesting({ state: {
        properties: [{
          id: 'oriental-avenue',
          mortgaged: true
        }]
      }});

      it('should not improve the property', function() {
        expect(() => this.dispatch(improveProperty('player-1', 'oriental-avenue')))
          .to.throw(MonopolyError, /mortgaged/i);
        expect(this.getProperty('oriental-avenue').buildings).to.equal(0);
      });

      it('should not improve other properties in the same group', function() {
        expect(() => this.dispatch(improveProperty('player-1', 'connecticut-avenue')))
          .to.throw(MonopolyError, /mortgaged/i);
        expect(this.getProperty('connecticut-avenue').buildings).to.equal(0);
      });
    });

    describe('when the property has an improvement', function() {
      modifyGameForTesting({ state: {
        properties: [{
          id: 'oriental-avenue',
          buildings: 1
        }]
      }});

      it('should not improve unevenly', function() {
        expect(() => this.dispatch(improveProperty('player-1', 'oriental-avenue')))
          .to.throw(MonopolyError, /evenly/i);
        expect(this.getProperty('oriental-avenue').buildings).to.equal(1);
      });
    });

    describe('when the property is fully improved', function() {
      modifyGameForTesting({ state: {
        properties: [{
          group: 'lightblue',
          buildings: 4
        }, {
          id: 'oriental-avenue',
          buildings: 5
        }]
      }});

      it('should not improve the property', function() {
        expect(() => this.dispatch(improveProperty('player-1', 'oriental-avenue')))
          .to.throw(MonopolyError, /fully improved/i);
        expect(this.getProperty('oriental-avenue').buildings).to.equal(5);
      });

      it('should still improve other unimproved properties', function() {
        this.dispatch(improveProperty('player-1', 'connecticut-avenue'));
        expect(this.getProperty('connecticut-avenue').buildings).to.equal(5);
      });
    });

    describe('when there are not enough houses', function() {
      modifyGameForTesting({ state: {
        houses: 0,
        properties: [{
          group: 'brown',
          buildings: 4,
          owner: 'player-1'
        }]
      }});

      it('should not improve the property when a house is needed', function() {
        expect(() => this.dispatch(improveProperty('player-1', 'oriental-avenue')))
          .to.throw(MonopolyError, /houses/i);
        expect(this.getProperty('oriental-avenue').buildings).to.equal(0);
      });

      it('should still improve the property when a hotel is needed', function() {
        this.dispatch(improveProperty('player-1', 'baltic-avenue'));
        expect(this.getProperty('baltic-avenue').buildings).to.equal(5);
      });
    });

    describe('when there are not enough hotels', function() {
      modifyGameForTesting({ state: {
        hotels: 0,
        properties: [{
          group: 'brown',
          buildings: 4,
          owner: 'player-1'
        }]
      }});

      it('should not improve the property when a hotel is needed', function() {
        expect(() => this.dispatch(improveProperty('player-1', 'baltic-avenue')))
          .to.throw(MonopolyError, /hotels/i);
        expect(this.getProperty('baltic-avenue').buildings).to.equal(4);
      });

      it('should still improve the property when a house is needed', function() {
        this.dispatch(improveProperty('player-1', 'oriental-avenue'));
        expect(this.getProperty('oriental-avenue').buildings).to.equal(1);
      });
    });
  });
});
