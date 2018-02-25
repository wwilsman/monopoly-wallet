import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { unimproveGroup } from '../../src/actions/properties';

describe('Game: unimproving groups', function() {
  setupGameForTesting({ state: {
    houses: 1,
    players: [
      { token: 'top-hat' },
      { token: 'automobile' }
    ],
    properties: [{
      id: 'baltic-avenue',
      owner: 'top-hat'
    }, {
      group: 'lightblue',
      owner: 'top-hat',
      buildings: 5
    }, {
      id: 'oriental-avenue',
      buildings: 4
    }, {
      group: 'blue',
      owner: 'automobile',
      buildings: 5
    }]
  }});

  it('should take available houses and sell unavailable houses', function() {
    let group = this.getProperties('lightblue');
    // including houses on properties in this group, there are 5 total available.
    // the total building count for the group however, is currently 14.
    // we're selling the difference so available houses are never negative.
    let value = (14 - 5) * group[0].cost * this.config.buildingRate;

    this.dispatch(unimproveGroup('top-hat', 'lightblue'));

    expect(this.getPlayer('top-hat').balance).to.equal(1500 + value);
    expect(this.state.bank).to.equal(this.last.bank - value);
    expect(this.getProperty(group[0].id).buildings).to.equal(1);
    expect(this.getProperty(group[1].id).buildings).to.equal(2);
    expect(this.getProperty(group[2].id).buildings).to.equal(2);
    expect(this.state.hotels).to.equal(this.last.hotels + 2);
    expect(this.state.houses).to.equal(0);
  });

  it('should always sell unavailable houses', function() {
    const group = this.getProperties('blue');
    // with this group there is only 1 available house, but 10 buildings
    const value = (10 - 1) * group[0].cost * this.config.buildingRate;

    this.dispatch(unimproveGroup('automobile', 'blue'));

    expect(this.getPlayer('automobile').balance).to.equal(1500 + value);
    expect(this.state.bank).to.equal(this.last.bank - value);
    expect(this.getProperty(group[0].id).buildings).to.equal(0);
    expect(this.getProperty(group[1].id).buildings).to.equal(1);
    expect(this.state.hotels).to.equal(this.last.hotels + 2);
    expect(this.state.houses).to.equal(0);
  });

  it('should not unimprove an unowned group', function() {
    expect(() => this.dispatch(unimproveGroup('top-hat', 'blue')))
      .to.throw(MonopolyError, /owned by/i);
  });

  it('should not unimprove a partially owned group', function() {
    expect(() => this.dispatch(unimproveGroup('top-hat', 'brown')))
      .to.throw(MonopolyError, /unowned/i);
  });

  it('should create a notice', function() {
    const group = this.getProperties('lightblue');
    const value = (14 - 5) * group[0].cost * this.config.buildingRate;

    this.dispatch(unimproveGroup('top-hat', 'lightblue'));

    expect(this.state.notice.id).to.equal('property.unimproved-group');
    expect(this.state.notice.message).to.match(/unimproved 3 lightblue properties/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
    expect(this.state.notice.meta).to.have.property('properties')
      .that.has.deep.members([
        { id: 'oriental-avenue', buildings: 1 },
        { id: 'connecticut-avenue', buildings: 2 },
        { id: 'vermont-avenue', buildings: 2 }
      ]);
    expect(this.state.notice.meta).to.have.property('amount', value);
  });

  describe('when the bank is low', function() {
    modifyGameInTesting({ state: { bank: 0 }});

    it('should not unimprove the property', function() {
      let group = this.getProperties('lightblue');

      expect(() => this.dispatch(unimproveGroup('top-hat', 'lightblue')))
        .to.throw(MonopolyError, /insufficient/i);
      expect(group[0].buildings).to.equal(4);
      expect(group[1].buildings).to.equal(5);
      expect(group[2].buildings).to.equal(5);
    });
  });

  describe('when the group is a railroad or utility', function() {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'railroad',
        owner: 'top-hat'
      }, {
        group: 'utility',
        owner: 'top-hat'
      }]
    }});

    it('should not unimprove a railroad', function() {
      expect(() => this.dispatch(unimproveGroup('top-hat', 'railroad')))
        .to.throw(MonopolyError, /improve a railroad/i);
    });

    it('should not unimprove a utility', function() {
      expect(() => this.dispatch(unimproveGroup('top-hat', 'utility')))
        .to.throw(MonopolyError, /improve a utility/i);
    });
  });

  describe('when the property has no improvements', function() {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'lightblue',
        buildings: 0
      }]
    }});

    it('should not unimprove the property', function() {
      let group = this.getProperties('lightblue');

      expect(() => this.dispatch(unimproveGroup('top-hat', 'lightblue')))
        .to.throw(MonopolyError, /unimproved/i);
      expect(group[0].buildings).to.equal(0);
      expect(group[1].buildings).to.equal(0);
      expect(group[2].buildings).to.equal(0);
    });
  });

  describe('when no houses are needed', function() {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'lightblue',
        buildings: 4
      }]
    }});

    it('should unimprove the first highest built property normally', function() {
      const group = this.getProperties('lightblue');
      const value = group[0].cost * this.config.buildingRate;

      this.dispatch(unimproveGroup('top-hat', 'lightblue'));

      expect(this.getPlayer('top-hat').balance).to.equal(1500 + value);
      expect(this.state.bank).to.equal(this.last.bank - value);
      expect(this.getProperty(group[0].id).buildings).to.equal(3);
      expect(this.getProperty(group[1].id).buildings).to.equal(4);
      expect(this.getProperty(group[2].id).buildings).to.equal(4);
      expect(this.state.hotels).to.equal(this.last.hotels);
      expect(this.state.houses).to.equal(this.last.houses + 1);
    });
  });

  describe('when there are more than enough houses', function() {
    modifyGameInTesting({ state: { houses: 5 }});

    it('should unimprove the first highest built property normally', function() {
      const group = this.getProperties('lightblue');
      const value = group[0].cost * this.config.buildingRate;

      this.dispatch(unimproveGroup('top-hat', 'lightblue'));

      expect(this.getPlayer('top-hat').balance).to.equal(1500 + value);
      expect(this.state.bank).to.equal(this.last.bank - value);
      expect(this.getProperty(group[0].id).buildings).to.equal(4);
      expect(this.getProperty(group[1].id).buildings).to.equal(4);
      expect(this.getProperty(group[2].id).buildings).to.equal(5);
      expect(this.state.hotels).to.equal(this.last.hotels + 1);
      expect(this.state.houses).to.equal(this.last.houses - 4);
    });
  });
});
