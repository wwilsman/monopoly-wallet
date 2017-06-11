import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { payRent } from '../../../server/actions/properties';

describe('Game: paying rent', function() {
  setupGameForTesting({ state: {
    players: [{
      id: 'player-1',
      name: 'Player 1',
      token: 'top-hat'
    }, {
      id: 'player-2',
      name: 'Player 2',
      token: 'automobile'
    }],
    properties: [{
      id: 'baltic-avenue',
      owner: 'player-2'
    }, {
      group: 'lightblue',
      owner: 'player-2'
    }, {
      group: 'magenta',
      owner: 'player-2',
      buildings: 1
    }, {
      group: 'orange',
      owner: 'player-2',
      buildings: 5
    }]
  }});

  it('should pay rent for the player', function() {
    const property = this.getProperty('baltic-avenue');

    this.dispatch(payRent('player-1', property.id));

    expect(this.getPlayer('player-1').balance).to.equal(1500 - property.rent[0]);
    expect(this.getPlayer('player-2').balance).to.equal(1500 + property.rent[0]);
  });

  it('should pay double rent on monopolies', function() {
    const property = this.getProperty('oriental-avenue');

    this.dispatch(payRent('player-1', property.id));

    expect(this.getPlayer('player-1').balance).to.equal(1500 - (property.rent[0] * 2));
    expect(this.getPlayer('player-2').balance).to.equal(1500 + (property.rent[0] * 2));
  });

  it('should pay raised rent for a property with a house', function() {
    const property = this.getProperty('st-charles-place');

    this.dispatch(payRent('player-1', property.id));

    expect(this.getPlayer('player-1').balance).to.equal(1500 - property.rent[1]);
    expect(this.getPlayer('player-2').balance).to.equal(1500 + property.rent[1]);
  });

  it('should pay higher raised rent for a property with a hotel', function() {
    const property = this.getProperty('st-james-place');

    this.dispatch(payRent('player-1', property.id));

    expect(this.getPlayer('player-1').balance).to.equal(1500 - property.rent[5]);
    expect(this.getPlayer('player-2').balance).to.equal(1500 + property.rent[5]);
  });

  it('should not pay rent for an unowned property', function() {
    expect(() => this.dispatch(payRent('player-1', 'park-place')))
      .to.throw(MonopolyError, /unowned/);
    expect(this.getPlayer('player-1').balance).to.equal(1500);
    expect(this.getPlayer('player-2').balance).to.equal(1500);
  });

  describe('when the player has a low balance', function() {
    modifyGameInTesting({ state: {
      players: [{
        id: 'player-1',
        balance: 0
      }]
    }});

    it('should not pay rent for the player', function() {
      expect(() => this.dispatch(payRent('player-1', 'baltic-avenue')))
        .to.throw(MonopolyError, /insufficient/i);
      expect(this.getPlayer('player-1').balance).to.equal(0);
      expect(this.getPlayer('player-2').balance).to.equal(1500);
    });
  });

  describe('for railroads', function() {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'railroad',
        owner: 'player-2'
      }, {
        id: 'reading-railroad',
        owner: 'player-1'
      }]
    }});

    it('should pay rent based on the amount owned', function() {
      const railroads = this.getProperties('railroad')
        .filter((pr) => pr.owner === 'player-2');
      const rent = railroads[0].rent[railroads.length - 1];

      this.dispatch(payRent('player-1', railroads[0].id));

      expect(this.getPlayer('player-1').balance).to.equal(1500 - rent);
      expect(this.getPlayer('player-2').balance).to.equal(1500 + rent);
    });
  });

  describe('for utilities', function() {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'water-works',
        owner: 'player-2'
      }]
    }});

    it('should pay an amount multiplied by the dice roll', function() {
      const utility = this.getProperty('water-works');
      const rent = utility.rent[0] * 7;

      this.dispatch(payRent('player-1', utility.id, 7));

      expect(this.getPlayer('player-1').balance).to.equal(1500 - rent);
      expect(this.getPlayer('player-2').balance).to.equal(1500 + rent);
    });

    describe('with both', function() {
      modifyGameInTesting({ state: {
        properties: [{
          id: 'electric-company',
          owner: 'player-2'
        }]
      }});

      it('should pay a higher amount multiplied by the dice roll', function() {
        const utility = this.getProperty('water-works');
        const rent = utility.rent[1] * 7;

        this.dispatch(payRent('player-1', utility.id, 7));

        expect(this.getPlayer('player-1').balance).to.equal(1500 - rent);
        expect(this.getPlayer('player-2').balance).to.equal(1500 + rent);
      });
    });
  });
});
