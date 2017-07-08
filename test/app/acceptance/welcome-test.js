/* global describe, beforeEach, it */
import { expect } from 'chai';

import {
  setupAppForAcceptanceTesting,
  visit
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

  it('should redirect back to welcome on 404', function() {
    visit('/404-not-found');
    expect(this.location.pathname).to.equal('/');
  });

  describe('clicking the new game button', function() {
    beforeEach(function() {
      this.$.find('Button').at(0).simulate('click');
    });

    it('should create a new game', function() {
      expect(this.app.store.getState()).to.have.deep.property('game.id');
    });

    it('should go to the join game screen for the new game', function() {
      const { game: { id } } = this.app.store.getState();
      expect(this.location.pathname).to.equal(`/${id}/join`);
      expect(this.$.find('JoinGame')).to.exist;
    });
  });

  describe('clicking the join game button', function() {
    beforeEach(function() {
      this.$.find('Button').at(1).simulate('click');
    });

    it('should go to the join game screen', function() {
      expect(this.location.pathname).to.equal('/join');
      expect(this.$.find('JoinGame')).to.exist;
    });
  });
});
