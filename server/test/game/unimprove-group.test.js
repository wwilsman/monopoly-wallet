import expect from 'expect';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { unimproveGroup } from '../../src/actions/properties';

describe('Game: unimproving groups', () => {
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

    expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 + value);
    expect(this.state.bank).toBe(this.last.bank - value);
    expect(this.getProperty(group[0].id)).toHaveProperty('buildings', 1);
    expect(this.getProperty(group[1].id)).toHaveProperty('buildings', 2);
    expect(this.getProperty(group[2].id)).toHaveProperty('buildings', 2);
    expect(this.state.hotels).toBe(this.last.hotels + 2);
    expect(this.state.houses).toBe(0);
  });

  it('should always sell unavailable houses', function() {
    const group = this.getProperties('blue');
    // with this group there is only 1 available house, but 10 buildings
    const value = (10 - 1) * group[0].cost * this.config.buildingRate;

    this.dispatch(unimproveGroup('automobile', 'blue'));

    expect(this.getPlayer('automobile')).toHaveProperty('balance', 1500 + value);
    expect(this.state.bank).toBe(this.last.bank - value);
    expect(this.getProperty(group[0].id)).toHaveProperty('buildings', 0);
    expect(this.getProperty(group[1].id)).toHaveProperty('buildings', 1);
    expect(this.state.hotels).toBe(this.last.hotels + 2);
    expect(this.state.houses).toBe(0);
  });

  it('should not unimprove an unowned group', function() {
    expect(() => this.dispatch(unimproveGroup('top-hat', 'blue')))
      .toThrow(MonopolyError, /owned by/i);
  });

  it('should not unimprove a partially owned group', function() {
    expect(() => this.dispatch(unimproveGroup('top-hat', 'brown')))
      .toThrow(MonopolyError, /unowned/i);
  });

  it('should create a notice', function() {
    const group = this.getProperties('lightblue');
    const value = (14 - 5) * group[0].cost * this.config.buildingRate;

    this.dispatch(unimproveGroup('top-hat', 'lightblue'));

    expect(this.state.notice.id).toBe('property.unimproved-group');
    expect(this.state.notice.message).toMatch('unimproved 3 lightblue properties');
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('properties', [
      { id: 'connecticut-avenue', buildings: 2 },
      { id: 'vermont-avenue', buildings: 2 },
      { id: 'oriental-avenue', buildings: 1 }
    ]);
    expect(this.state.notice.meta).toHaveProperty('amount', value);
  });

  describe('when the bank is low', () => {
    modifyGameInTesting({ state: { bank: 0 }});

    it('should not unimprove the property', function() {
      let group = this.getProperties('lightblue');

      expect(() => this.dispatch(unimproveGroup('top-hat', 'lightblue')))
        .toThrow(MonopolyError, /insufficient/i);
      expect(group[0].buildings).toBe(4);
      expect(group[1].buildings).toBe(5);
      expect(group[2].buildings).toBe(5);
    });
  });

  describe('when the group is a railroad or utility', () => {
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
        .toThrow(MonopolyError, /improve a railroad/i);
    });

    it('should not unimprove a utility', function() {
      expect(() => this.dispatch(unimproveGroup('top-hat', 'utility')))
        .toThrow(MonopolyError, /improve a utility/i);
    });
  });

  describe('when the property has no improvements', () => {
    modifyGameInTesting({ state: {
      properties: [{
        group: 'lightblue',
        buildings: 0
      }]
    }});

    it('should not unimprove the property', function() {
      let group = this.getProperties('lightblue');

      expect(() => this.dispatch(unimproveGroup('top-hat', 'lightblue')))
        .toThrow(MonopolyError, /unimproved/i);
      expect(group[0].buildings).toBe(0);
      expect(group[1].buildings).toBe(0);
      expect(group[2].buildings).toBe(0);
    });
  });

  describe('when no houses are needed', () => {
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

      expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 + value);
      expect(this.state.bank).toBe(this.last.bank - value);
      expect(this.getProperty(group[0].id)).toHaveProperty('buildings', 3);
      expect(this.getProperty(group[1].id)).toHaveProperty('buildings', 4);
      expect(this.getProperty(group[2].id)).toHaveProperty('buildings', 4);
      expect(this.state.hotels).toBe(this.last.hotels);
      expect(this.state.houses).toBe(this.last.houses + 1);
    });
  });

  describe('when there are more than enough houses', () => {
    modifyGameInTesting({ state: { houses: 5 }});

    it('should unimprove the first highest built property normally', function() {
      const group = this.getProperties('lightblue');
      const value = group[0].cost * this.config.buildingRate;

      this.dispatch(unimproveGroup('top-hat', 'lightblue'));

      expect(this.getPlayer('top-hat')).toHaveProperty('balance', 1500 + value);
      expect(this.state.bank).toBe(this.last.bank - value);
      expect(this.getProperty(group[0].id)).toHaveProperty('buildings', 4);
      expect(this.getProperty(group[1].id)).toHaveProperty('buildings', 4);
      expect(this.getProperty(group[2].id)).toHaveProperty('buildings', 5);
      expect(this.state.hotels).toBe(this.last.hotels + 1);
      expect(this.state.houses).toBe(this.last.houses - 4);
    });
  });
});
