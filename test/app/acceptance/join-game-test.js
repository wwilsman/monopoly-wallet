import { expect } from 'chai';
import $ from 'jquery';

import {
  describe,
  describeApplication,
  beforeEach,
  it,
  mockGame
} from '../helpers.js';

import JoinGamePage from '../pages/join-game';

describeApplication('join game screen', function() {
  describe('without specifying a room', function() {
    beforeEach(function() {
      this.visit('/join');
    });

    it('should show the find game modal', function() {
      expect(JoinGamePage.findGameModal).to.exist;
    });

    it('should display a game room input', function() {
      expect(JoinGamePage.findGameLabel).to.have.text('enter room');
      expect(JoinGamePage.findGameInput).to.exist;
    });

    describe('and searching for an existing room', function() {
      beforeEach(function() {
        JoinGamePage.findGame(this.room);
      });

      it('should go to the join game route for a game', function() {
        expect(this.location.pathname).to.equal(`/${this.room}/join`);
      });
    });

    describe('and searching for a non-existent room', function() {
      beforeEach(function() {
        JoinGamePage.findGame('f4k33');
      });

      it.still('should not change routes', function() {
        expect(this.location.pathname).to.equal('/join');
      });

      it('should show an error message', function() {
        expect(JoinGamePage.findGameError).to.have.text('Game not found');
      });
    });
  });

  describe('with a specific room', function() {
    beforeEach(function() {
      this.visit(`/${this.room}/join`);
    });

    it('should display a name input field');
    it('should display a token select field');
    it('should join the game with the name and selected token');
    it('should not allow joining unless all fields are complete');

    describe('with other players', function() {
      mockGame({ state: {
        players: [
          { token: 'top-hat' },
          { token: 'automobile' }
        ]
      }});

      it('should prevent selecting used tokens');
      it('should enable a used token with the token player\'s name');

      describe('when one is playing', function() {
        it('should not enable their token with their name');
        it('should still enable the other token with the other\'s name');
      });
    });
  });

  describe('with a non-existent room', function() {
    beforeEach(function() {
      this.visit('/f4k3e/join');
    });

    it('should redirect to no room', function() {
      expect(this.location.pathname).to.equal('/join');
    });
  });
});
