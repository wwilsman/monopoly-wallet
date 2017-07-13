/* global describe, beforeEach, it */
import { expect } from 'chai';

import {
  setupAppForAcceptanceTesting,
  visit,
  click,
  waitUntil
} from '../acceptance-helpers';

describe('App: welcome screen', function() {
  setupAppForAcceptanceTesting();

  it('should render the welcome screen', function() {
    expect(this.$.find('Welcome')).to.exist;
  });

  it('should display the app name', function() {
    expect(this.$.find('h1')).to.have.text('MonopolyWallet');
  });

  it('should display a new game button', function() {
    expect(this.$.find('Button').at(0)).to.have.text('New Game');
  });

  it('should display a join game button', function() {
    expect(this.$.find('Button').at(1)).to.have.text('Join Game');
  });

  describe('visiting a non-existent route', function() {
    beforeEach(async function() {
      await visit('/404-not-found');
    });

    it('should redirect back to welcome', async function() {
      expect(this.location.pathname).to.equal('/');
    });
  });

  describe('clicking the new game button', function() {
    beforeEach(async function() {
      await click(this.$.find('Button').at(0));
      await waitUntil(() => !this.state.game.loading);
    });

    it('should create a new game', function() {
      expect(this.state).to.have.deep.property('game.id');
    });

    it('should go to the join game route for a room', function() {
      expect(this.location.pathname).to.equal(`/${this.state.game.id}/join`);
    });

    it('should show the join game screen', function() {
      expect(this.$.find('JoinGame')).to.exist;
    });
  });

  describe('clicking the join game button', function() {
    beforeEach(async function() {
      await click(this.$.find('Button').at(1));
    });

    it('should go to the join game route', function() {
      expect(this.location.pathname).to.equal('/join');
    });

    it('should show the join game screen', function() {
      expect(this.$.find('JoinGame')).to.exist;
    });
  });
});
