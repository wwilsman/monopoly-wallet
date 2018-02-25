import { expect } from 'chai';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { describeApplication } from '../helpers';

import WelcomePage from '../pages/welcome';
import FindRoomPage from '../pages/find-room';
import JoinGamePage from '../pages/join-game';

describeApplication('WelcomeScreen', function() {
  beforeEach(function() {
    return this.visit('/', () => {
      expect(WelcomePage.$root).to.exist;
    });
  });

  it('should display the app name', function() {
    expect(WelcomePage.title).to.equal('MonopolyWallet');
  });

  it('should display a new game button', function() {
    expect(WelcomePage.$newGameBtn).to.have.text('New Game');
  });

  it('should display a join game button', function() {
    expect(WelcomePage.$joinGameBtn).to.have.text('Join Game');
  });

  describe('visiting a non-existent route', function() {
    beforeEach(function() {
      return this.visit('/404-not-found');
    });

    it.always('should redirect back to welcome', function() {
      expect(this.location.pathname).to.equal('/');
    });
  });

  describe('clicking the new game button', function() {
    beforeEach(function() {
      return WelcomePage.clickNewGame();
    });

    it('should create a new game', function() {
      expect(this.state.app.room).to.not.be.empty;
    });

    it('should go to the join game route for a room', function() {
      expect(this.location.pathname).to.equal(`/${this.state.app.room}/join`);
      expect(JoinGamePage.$root).to.exist;
    });

    describe('then navigating back', function() {
      beforeEach(function() {
        return JoinGamePage.clickBack();
      });

      it('should go back', function() {
        expect(this.location.pathname).to.equal('/');
        expect(WelcomePage.$root).to.exist;
      });

      it('should disconnect from the game', function() {
        expect(this.state.app.room).to.be.empty;
        expect(this.state.game).to.be.null;
      });
    });
  });

  describe('clicking the join game button', function() {
    beforeEach(function() {
      return WelcomePage.clickJoinGame();
    });

    it('should go to the find room screen', function() {
      expect(this.location.pathname).to.equal('/join');
      expect(FindRoomPage.$root).to.exist;
    });

    describe('then navigating back', function() {
      beforeEach(function() {
        return FindRoomPage.clickBack();
      });

      it('should go back', function() {
        expect(this.location.pathname).to.equal('/');
        expect(WelcomePage.$root).to.exist;
      });

      it('should clear the game ', function() {
        expect(this.state.app.room).to.be.empty;
        expect(this.state.game).to.be.null;
      });
    });
  });
});
