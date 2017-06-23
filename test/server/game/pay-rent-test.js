import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../game-helpers';

import MonopolyError from '../../../server/rules/error';
import { payRent } from '../../../server/actions/properties';

describe('Game: paying rent', function() {
  setupGameForTesting({ state: {
    players: [
      { token: 'top-hat' },
      { token: 'automobile' }
    ],
    properties: [{
      id: 'baltic-avenue',
      owner: 'automobile'
    }, {
      group: 'lightblue',
      owner: 'automobile'
    }, {
      group: 'magenta',
      owner: 'automobile',
      buildings: 1
    }, {
      group: 'orange',
      owner: 'automobile',
      buildings: 5
    }]
  }});

  it('should pay rent for the player', function() {
    const property = this.getProperty('baltic-avenue');

    this.dispatch(payRent('top-hat', property.id));

    expect(this.getPlayer('top-hat').balance).to.equal(1500 - property.rent[0]);
    expect(this.getPlayer('automobile').balance).to.equal(1500 + property.rent[0]);
  });

  it('should pay double rent on monopolies', function() {
    const property = this.getProperty('oriental-avenue');

    this.dispatch(payRent('top-hat', property.id));

    expect(this.getPlayer('top-hat').balance).to.equal(1500 - (property.rent[0] * 2));
    expect(this.getPlayer('automobile').balance).to.equal(1500 + (property.rent[0] * 2));
  });

  it('should pay raised rent for a property with a house', function() {
    const property = this.getProperty('st-charles-place');

    this.dispatch(payRent('top-hat', property.id));

    expect(this.getPlayer('top-hat').balance).to.equal(1500 - property.rent[1]);
    expect(this.getPlayer('automobile').balance).to.equal(1500 + property.rent[1]);
  });

  it('should pay higher raised rent for a property with a hotel', function() {
    const property = this.getProperty('st-james-place');

    this.dispatch(payRent('top-hat', property.id));

    expect(this.getPlayer('top-hat').balance).to.equal(1500 - property.rent[5]);
    expect(this.getPlayer('automobile').balance).to.equal(1500 + property.rent[5]);
  });

  it('should not pay rent for an unowned property', function() {
    expect(() => this.dispatch(payRent('top-hat', 'park-place')))
      .to.throw(MonopolyError, /unowned/);
    expect(this.getPlayer('top-hat').balance).to.equal(1500);
    expect(this.getPlayer('automobile').balance).to.equal(1500);
  });

  it('should create a notice', function() {
    const property = this.getProperty('baltic-avenue');

    this.dispatch(payRent('top-hat', property.id));

    expect(this.state.notice.id).to.equal('property.paid-rent');
    expect(this.state.notice.message).to.match(/paid .* rent/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
    expect(this.state.notice.meta).to.have.property('other')
      .that.has.property('token', property.owner);
    expect(this.state.notice.meta).to.have.property('property')
      .that.has.property('id', property.id);
    expect(this.state.notice.meta).to.have.property('amount', property.rent[0]);
  });

  describe('when the player has a low balance', function() {
    modifyGameInTesting({ state: {
      players: [{
        token: 'top-hat',
        balance: 0
      }]
    }});

    it('should not pay rent for the player', function() {
      expect(() => this.dispatch(payRent('top-hat', 'baltic-avenue')))
        .to.throw(MonopolyError, /insufficient/i);
      expect(this.getPlayer('top-hat').balance).to.equal(0);
      expect(this.getPlayer('automobile').balance).to.equal(1500);
    });
  });

  describe('for railroads', function() {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'railroad',
        owner: 'automobile'
      }, {
        id: 'reading-railroad',
        owner: 'top-hat'
      }]
    }});

    it('should pay rent based on the amount owned', function() {
      const railroads = this.getProperties('railroad')
        .filter((pr) => pr.owner === 'automobile');
      const rent = railroads[0].rent[railroads.length - 1];

      this.dispatch(payRent('top-hat', railroads[0].id));

      expect(this.getPlayer('top-hat').balance).to.equal(1500 - rent);
      expect(this.getPlayer('automobile').balance).to.equal(1500 + rent);
    });
  });

  describe('for utilities', function() {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'water-works',
        owner: 'automobile'
      }]
    }});

    it('should pay an amount multiplied by the dice roll', function() {
      const utility = this.getProperty('water-works');
      const rent = utility.rent[0] * 7;

      this.dispatch(payRent('top-hat', utility.id, 7));

      expect(this.getPlayer('top-hat').balance).to.equal(1500 - rent);
      expect(this.getPlayer('automobile').balance).to.equal(1500 + rent);
    });

    describe('with both', function() {
      modifyGameInTesting({ state: {
        properties: [{
          id: 'electric-company',
          owner: 'automobile'
        }]
      }});

      it('should pay a higher amount multiplied by the dice roll', function() {
        const utility = this.getProperty('water-works');
        const rent = utility.rent[1] * 7;

        this.dispatch(payRent('top-hat', utility.id, 7));

        expect(this.getPlayer('top-hat').balance).to.equal(1500 - rent);
        expect(this.getPlayer('automobile').balance).to.equal(1500 + rent);
      });
    });
  });
});
