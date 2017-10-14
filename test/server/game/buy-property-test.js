import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupGameForTesting,
  modifyGameInTesting
} from '../game-helpers';

import MonopolyError from '../../../server/error';
import { buyProperty } from '../../../server/actions/properties';

describe('Game: buying properties', function() {
  setupGameForTesting({ state: {
    players: [
      { token: 'top-hat' },
      { token: 'automobile' }
    ],
    properties: [{
      id: 'oriental-avenue',
      owner: 'automobile'
    }],
    auction: {
      property: 'connecticut-avenue'
    }
  }});

  it('should buy the property for the player', function() {
    const property = this.getProperty('baltic-avenue');

    this.dispatch(buyProperty('top-hat', 'baltic-avenue'));

    expect(this.getProperty(property.id).owner).to.equal('top-hat');
    expect(this.getPlayer('top-hat').balance).to.equal(this.config.playerStart - property.price);
    expect(this.state.bank).to.equal(this.last.bank + property.price);
  });

  it('should buy the property for a specific price', function() {
    this.dispatch(buyProperty('top-hat', 'baltic-avenue', 10));

    expect(this.getProperty('baltic-avenue').owner).to.equal('top-hat');
    expect(this.getPlayer('top-hat').balance).to.equal(this.config.playerStart - 10);
    expect(this.state.bank).to.equal(this.last.bank + 10);
  });

  it('should not buy the property for a non-existent player', function() {
    expect(() => this.dispatch(buyProperty('thimble', 'baltic-avenue', -10)))
      .to.throw(MonopolyError, /player/);
    expect(this.getProperty('baltic-avenue').owner).to.not.equal('thimble');
  });

  it('should not buy the property for a negative price', function() {
    expect(() => this.dispatch(buyProperty('top-hat', 'baltic-avenue', -10)))
      .to.throw(MonopolyError, /negative/);
    expect(this.getProperty('baltic-avenue').owner).to.not.equal('top-hat');
  });

  it('should not buy the property when already owned', function() {
    expect(() => this.dispatch(buyProperty('top-hat', 'oriental-avenue')))
      .to.throw(MonopolyError, /owned/);
    expect(this.getProperty('oriental-avenue').owner).to.equal('automobile');
  });

  it('should not buy the property when it is up for auction', function() {
    expect(() => this.dispatch(buyProperty('top-hat', 'connecticut-avenue')))
      .to.throw(MonopolyError, /auction/);
    expect(this.getProperty('connecticut-avenue').owner).to.not.equal('top-hat');
  });

  it('should not buy the property with insufficient funds', function() {
    expect(() => this.dispatch(buyProperty('top-hat', 'baltic-avenue', this.config.playerStart + 1)))
      .to.throw(MonopolyError, /insufficient/i);
    expect(this.getProperty('baltic-avenue').owner).to.not.equal('top-hat');
  });

  it('should create a notice', function() {
    this.dispatch(buyProperty('top-hat', 'baltic-avenue'));

    expect(this.state.notice.id).to.equal('property.bought');
    expect(this.state.notice.message).to.match(/purchased/);
    expect(this.state.notice.meta).to.have.property('player')
      .that.has.property('token', 'top-hat');
    expect(this.state.notice.meta).to.have.property('property')
      .that.has.property('id', 'baltic-avenue');
  });

  describe('when the player owns the other properties in the group', function() {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'mediterranean-avenue',
        owner: 'top-hat'
      }]
    }});

    it('should monopolize the other properties', function() {
      this.dispatch(buyProperty('top-hat', 'baltic-avenue'));

      expect(this.getProperty('baltic-avenue').owner).to.equal('top-hat');
      expect(this.getProperty('baltic-avenue').monopoly).to.be.true;
      expect(this.getProperty('mediterranean-avenue').monopoly).to.be.true;
    });
  });
});
