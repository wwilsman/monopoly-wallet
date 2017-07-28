import { expect } from 'chai';
import $ from 'jquery';

import {
  beforeEach,
  describe,
  describeApplication,
  it
} from '../helpers';

import WelcomePage from '../pages/welcome';

describeApplication('welcome screen', function() {
  it('should display the app name', function() {
    expect($('h1')).to.have.text('MonopolyWallet');
  });

  it('should display a new game button', function() {
    expect(WelcomePage.newGameButton).to.have.text('New Game');
  });

  it('should display a join game button', function() {
    expect(WelcomePage.joinGameButton).to.have.text('Join Game');
  });

  describe('visiting a non-existent route', function() {
    beforeEach(function() {
      this.visit('/404-not-found');
    });

    it('should redirect back to welcome', function() {
      expect(this.location.pathname).to.equal('/');
    });
  });

  describe('clicking the new game button', function() {
    beforeEach(function() {
      WelcomePage.clickNewGame();
    });

    it('should create a new game', function() {
      expect(this.state.game.room).to.not.be.empty;
    });

    it('should go to the join game route for a room', function() {
      expect(this.location.pathname).to.equal(`/${this.state.game.room}/join`);
    });
  });

  describe('clicking the join game button', function() {
    beforeEach(function() {
      WelcomePage.clickJoinGame();
    });

    it('should go to the join game route', function() {
      expect(this.location.pathname).to.equal('/join');
    });
  });
});
