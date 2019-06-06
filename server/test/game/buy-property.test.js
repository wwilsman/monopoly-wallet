import expect from 'expect';

import {
  setupGameForTesting,
  modifyGameInTesting
} from './helpers';

import MonopolyError from '../../src/error';
import { buyProperty } from '../../src/actions/properties';

describe('Game: buying properties', () => {
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

    expect(this.getProperty(property.id)).toHaveProperty('owner', 'top-hat');
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', this.config.playerStart - property.price);
    expect(this.state.bank).toBe(this.last.bank + property.price);
  });

  it('should buy the property for a specific price', function() {
    this.dispatch(buyProperty('top-hat', 'baltic-avenue', 10));

    expect(this.getProperty('baltic-avenue')).toHaveProperty('owner', 'top-hat');
    expect(this.getPlayer('top-hat')).toHaveProperty('balance', this.config.playerStart - 10);
    expect(this.state.bank).toBe(this.last.bank + 10);
  });

  it('should not buy the property for a non-existent player', function() {
    expect(() => this.dispatch(buyProperty('thimble', 'baltic-avenue', -10)))
      .toThrow(MonopolyError, /player/);
    expect(this.getProperty('baltic-avenue')).not.toHaveProperty('owner', 'thimble');
  });

  it('should not buy the property for a negative price', function() {
    expect(() => this.dispatch(buyProperty('top-hat', 'baltic-avenue', -10)))
      .toThrow(MonopolyError, /negative/);
    expect(this.getProperty('baltic-avenue')).not.toHaveProperty('owner', 'top-hat');
  });

  it('should not buy the property when already owned', function() {
    expect(() => this.dispatch(buyProperty('top-hat', 'oriental-avenue')))
      .toThrow(MonopolyError, /owned/);
    expect(this.getProperty('oriental-avenue')).toHaveProperty('owner', 'automobile');
  });

  it('should not buy the property when it is up for auction', function() {
    expect(() => this.dispatch(buyProperty('top-hat', 'connecticut-avenue')))
      .toThrow(MonopolyError, /auction/);
    expect(this.getProperty('connecticut-avenue')).not.toHaveProperty('owner', 'top-hat');
  });

  it('should not buy the property with insufficient funds', function() {
    expect(() => this.dispatch(buyProperty('top-hat', 'baltic-avenue', this.config.playerStart + 1)))
      .toThrow(MonopolyError, /insufficient/i);
    expect(this.getProperty('baltic-avenue')).not.toHaveProperty('owner', 'top-hat');
  });

  it('should create a notice', function() {
    this.dispatch(buyProperty('top-hat', 'baltic-avenue'));

    expect(this.state.notice.id).toBe('property.bought');
    expect(this.state.notice.message).toMatch(/purchased/);
    expect(this.state.notice.meta).toHaveProperty('player.token', 'top-hat');
    expect(this.state.notice.meta).toHaveProperty('property.id', 'baltic-avenue');
  });

  describe('when the player owns the other properties in the group', () => {
    modifyGameInTesting({ state: {
      properties: [{
        id: 'mediterranean-avenue',
        owner: 'top-hat'
      }]
    }});

    it('should monopolize the other properties', function() {
      this.dispatch(buyProperty('top-hat', 'baltic-avenue'));

      expect(this.getProperty('baltic-avenue')).toHaveProperty('owner', 'top-hat');
      expect(this.getProperty('baltic-avenue')).toHaveProperty('monopoly', true);
      expect(this.getProperty('mediterranean-avenue')).toHaveProperty('monopoly', true);
    });
  });
});
