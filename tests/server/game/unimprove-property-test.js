import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../test-helpers';

import MonopolyError from '../../../server/rules/error';
import { unimproveProperty } from '../../../server/actions/properties';

describe('Game: unimproving properties', function() {
  setupGameForTesting({ state: {
    players: [{ id: 'player-1' }],
    properties: [{
      group: 'lightblue',
      owner: 'player-1',
      buildings: 4
    }]
  }});

  it('should remove a house from the property', function() {
    const property = this.getProperty('oriental-avenue');
    const value = property.cost * this.config.buildingRate;

    this.dispatch(unimproveProperty('player-1', property.id));

    expect(this.getPlayer('player-1').balance).to.equal(1500 + value);
    expect(this.state.bank).to.equal(this.last.bank - value);
    expect(this.getProperty(property.id).buildings).to.equal(3);
    expect(this.state.houses).to.equal(this.last.houses + 1);
  });

  it('should not unimprove an unowned property', function() {
    expect(() => this.dispatch(unimproveProperty('player-1', 'baltic-avenue')))
      .to.throw(MonopolyError, /not own/i);
  });

  describe('when a property is fully improved', function() {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'oriental-avenue',
        buildings: 5
      }]
    }});

    it('should remove a hotel and add 4 houses', function() {
      this.dispatch(unimproveProperty('player-1', 'oriental-avenue'));

      expect(this.getProperty('oriental-avenue').buildings).to.equal(4);
      expect(this.state.houses).to.equal(this.last.houses - 4);
      expect(this.state.hotels).to.equal(this.last.hotels + 1);
    });
  });

  describe('when the bank is low', function() {
    modifyGameInTesting({ state: { bank: 0 }});

    it('should not unimprove the property', function() {
      expect(() => this.dispatch(unimproveProperty('player-1', 'oriental-avenue')))
        .to.throw(MonopolyError, /insufficient/i);
      expect(this.getProperty('oriental-avenue').buildings).to.equal(4);
    });
  });

  describe('when a property is a railroad or utility', function() {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'reading-railroad',
        owner: 'player-1'
      }, {
        id: 'electric-company',
        owner: 'player-1'
      }]
    }});

    it('should not unimprove a railroad', function() {
      expect(() => this.dispatch(unimproveProperty('player-1', 'reading-railroad')))
        .to.throw(MonopolyError, /improve a railroad/i);
    });

    it('should not unimprove a utility', function() {
      expect(() => this.dispatch(unimproveProperty('player-1', 'electric-company')))
        .to.throw(MonopolyError, /improve a utility/i);
    });
  });

  describe('when the property has less improvements', function() {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'oriental-avenue',
        buildings: 3
      }]
    }});

    it('should not unimprove unevenly', function() {
      expect(() => this.dispatch(unimproveProperty('player-1', 'oriental-avenue')))
        .to.throw(MonopolyError, /evenly/i);
      expect(this.getProperty('oriental-avenue').buildings).to.equal(3);
    });

    it('should still unimprove other improved properties', function() {
      this.dispatch(unimproveProperty('player-1', 'connecticut-avenue'));
      expect(this.getProperty('connecticut-avenue').buildings).to.equal(3);
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
      expect(() => this.dispatch(unimproveProperty('player-1', 'oriental-avenue')))
        .to.throw(MonopolyError, /not improved/i);
      expect(this.getProperty('oriental-avenue').buildings).to.equal(0);
    });
  });

  describe('when there are not enough houses', function() {
    modifyGameInTesting({ state: {
      houses: 0,
      properties: [{
        group: 'brown',
        owner: 'player-1',
        buildings: 5
      }]
    }});

    it('should not unimprove the property when houses are needed', function() {
      expect(() => this.dispatch(unimproveProperty('player-1', 'baltic-avenue')))
        .to.throw(MonopolyError, /houses/i);
      expect(this.getProperty('baltic-avenue').buildings).to.equal(5);
    });

    it('should still unimprove the property when no houses are needed', function() {
      this.dispatch(unimproveProperty('player-1', 'oriental-avenue'));
      expect(this.getProperty('oriental-avenue').buildings).to.equal(3);
    });
  });
});