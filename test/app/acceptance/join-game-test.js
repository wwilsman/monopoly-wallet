import { expect } from 'chai';
import { describe, beforeEach, it } from '../test-helpers';
import { describeApplication, mockGame } from '../acceptance-helpers';

import JoinGamePage from '../pages/join-game';

describeApplication('JoinGameScreen', function() {
  describe('without specifying a room', function() {
    beforeEach(function() {
      return this.visit('/join', () => {
        expect(JoinGamePage.$root).to.exist;
      });
    });

    it('should display a join game heading', function() {
      expect(JoinGamePage.heading).to.equal('Join Game');
    });

    it('should display the find game modal', function() {
      expect(JoinGamePage.$findGameModal).to.exist;
    });

    it('should display a game room input', function() {
      expect(JoinGamePage.$findGameInput).to.exist;
      expect(JoinGamePage.findGameLabel).to.equal('enter room');
    });

    describe('and searching for an existing room', function() {
      beforeEach(function() {
        JoinGamePage.findGame(this.room.id);
      });

      it('should show a loading indicator and disable inputs', function() {
        expect(JoinGamePage.isFindGameLoading).to.be.true;
        expect(JoinGamePage.$findGameInput).to.have.prop('disabled', true);
        expect(JoinGamePage.$findGameBtn).to.have.prop('disabled', true);
      });

      it('should go to the join game route for a game', function() {
        expect(this.location.pathname).to.equal(`/${this.room.id}/join`);
        expect(this.state.app.room).to.equal(this.room.id);
      });

      describe('then navigating back', function() {
        beforeEach(function() {
          return this.visit('/join', () => {
            expect(this.location.pathname).to.equal('/join');
          });
        });

        it('should clear the game state', function() {
          expect(this.state.app.room).to.not.equal(this.room.id);
        });
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
        expect(JoinGamePage.findGameError).to.equal('Game not found');
      });
    });
  });

  describe('with a specific room', function() {
    beforeEach(function() {
      return this.visit(`/${this.room.id}/join`, () => {
        expect(JoinGamePage.$root).to.exist;
      });
    });

    it('should display a join game heading', function() {
      expect(JoinGamePage.heading).to.equal('Join Game');
    });

    it('should display a name input field', function() {
      expect(JoinGamePage.$nameInput).to.exist;
      expect(JoinGamePage.nameLabel).to.equal('Your name');
    });

    it('should display a token select field', function() {
      const tokenCount = this.state.config.playerTokens.length;
      expect(JoinGamePage.$tokens).to.have.lengthOf(tokenCount);
      expect(JoinGamePage.tokensLabel).to.equal('Select a token');
    });

    describe('when only a name is provided', function() {
      beforeEach(function() {
        JoinGamePage.fillName('Player 1');
      });

      it('should not allow joining yet', function() {
        expect(JoinGamePage.$joinBtn).to.have.prop('disabled', true);
      });
    });

    describe('when only a token is selected', function() {
      beforeEach(function() {
        JoinGamePage.selectToken('top-hat');
      });

      it('should not allow joining yet', function() {
        expect(JoinGamePage.$joinBtn).to.have.prop('disabled', true);
      });
    });

    describe('when both a name and token is selected', function() {
      beforeEach(function() {
        JoinGamePage.fillName('Player 1');
        JoinGamePage.selectToken('top-hat');
      });

      it('should allow joining', function() {
        expect(JoinGamePage.$joinBtn).to.have.prop('disabled', false);
      });

      describe('and join game is clicked', function() {
        beforeEach(function() {
          JoinGamePage.joinGame();
        });

        it('should show a loading indicator and disabled inputs', function() {
          expect(JoinGamePage.isJoinGameLoading).to.be.true;
          expect(JoinGamePage.$nameInput).to.have.prop('disabled', true);
          expect(JoinGamePage.areTokensDisabled).to.be.true;
          expect(JoinGamePage.$joinBtn).to.have.prop('disabled', true);
        });

        it('should join the game', function() {
          expect(this.state.game.players).to.have.property('top-hat');
          expect(this.state.app.player).to.equal('top-hat');
        });

        it('should go to the game\'s home screen', function() {
          expect(this.location.pathname).to.equal(`/${this.room.id}`);
        });
      });
    });

    describe('with other players', function() {
      mockGame({ state: {
        players: [
          { token: 'top-hat' },
          { token: 'automobile' }
        ]
      }});

      it('should prevent selecting used tokens', function() {
        expect(JoinGamePage.$token('top-hat')).to.have.prop('disabled', true);
        expect(JoinGamePage.$token('automobile')).to.have.prop('disabled', true);
      });

      describe('when one of their names are filled in', function() {
        beforeEach(function() {
          JoinGamePage.fillName('player 1');
        });

        it('should enable a used token with the token player\'s name', function() {
          expect(JoinGamePage.$token('top-hat')).to.have.prop('disabled', false);
          expect(JoinGamePage.$token('automobile')).to.have.prop('disabled', true);
        });

        describe('and they are playing', function() {
          beforeEach(function() {
            return this.room.constructor.connect(this.room.id)
              .then((room) => room.join('Player 1', 'top-hat'));
          });

          it('should not enable their token with their name', function() {
            expect(JoinGamePage.$token('top-hat')).to.have.prop('disabled', true);
            expect(JoinGamePage.$token('automobile')).to.have.prop('disabled', true);
          });
        });
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
