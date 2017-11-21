import { expect } from 'chai';
import { describe, beforeEach, it } from '../test-helpers';
import { describeApplication } from '../acceptance-helpers';

import WelcomePage from '../pages/welcome';

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
      this.visit('/404-not-found');
    });

    it.still('should redirect back to welcome', function() {
      expect(this.location.pathname).to.equal('/');
    });
  });

  describe('clicking the new game button', function() {
    beforeEach(function() {
      WelcomePage.clickNewGame();
    });

    it('should create a new game', function() {
      expect(this.state.app.room).to.not.be.empty;
    });

    it('should go to the join game route for a room', function() {
      expect(this.location.pathname).to.equal(`/${this.state.app.room}/join`);
    });

    describe('then navigating back', function() {
      beforeEach(function() {
        WelcomePage.goBack();
      });

      it('should go back', function() {
        expect(this.location.pathname).to.equal('/');
      });

      it('should clear the game room', function() {
        expect(this.state.app.room).to.be.empty;
      });
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
