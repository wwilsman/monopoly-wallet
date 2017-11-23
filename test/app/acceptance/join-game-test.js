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

    it('should display a room code input', function() {
      expect(JoinGamePage.$findGameInput).to.exist;
      expect(JoinGamePage.findGameLabel).to.equal('room code');
    });

    describe('and searching for an existing room', function() {
      beforeEach(function() {
        return JoinGamePage.findGame(this.room.id);
      });

      it('should show a loading indicator', function() {
        expect(JoinGamePage.isLoading).to.be.true;
      });

      it('should disable all inputs', function() {
        expect(JoinGamePage.$findGameInput).to.have.prop('disabled', true);
        expect(JoinGamePage.$findGameBtn).to.have.prop('disabled', true);
      });

      it('should go to the join game route for a game', function() {
        expect(this.location.pathname).to.equal(`/${this.room.id}/join`);
        expect(JoinGamePage.room).to.equal(this.room.id);
      });

      describe('then navigating back', function() {
        beforeEach(function() {
          return JoinGamePage.goBack(() => {
            expect(JoinGamePage.room).to.be.empty;
          });
        });

        it('should go back', function() {
          expect(this.location.pathname).to.equal('/join');
        });

        it('should clear the game room', function() {
          expect(this.state.app.room).to.be.empty;
        });
      });
    });

    describe('and searching for a non-existent room', function() {
      beforeEach(function() {
        return JoinGamePage.findGame('f4k33');
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
        expect(JoinGamePage.room).to.equal(this.room.id);
      });
    });

    it('should display a join game heading', function() {
      expect(JoinGamePage.heading).to.equal('Join Game');
    });

    it('should display the room code', function() {
      expect(JoinGamePage.room).to.equal(this.room.id);
    });

    it('should display a name input field', function() {
      expect(JoinGamePage.$nameInput).to.exist;
      expect(JoinGamePage.nameLabel).to.equal('Your name');
    });

    it('should display a token select field', function() {
      let tokenCount = this.state.config.playerTokens.length;
      expect(JoinGamePage.$tokens).to.have.lengthOf(tokenCount);
      expect(JoinGamePage.tokensLabel).to.equal('Select a token');
    });

    it.still('should not show a back button', function() {
      expect(JoinGamePage.$backBtn).to.not.exist;
    });

    describe('when only a name is provided', function() {
      beforeEach(function() {
        return JoinGamePage.fillName('Player 1');
      });

      it('should not allow joining yet', function() {
        expect(JoinGamePage.$joinBtn).to.have.prop('disabled', true);
      });
    });

    describe('when only a token is selected', function() {
      beforeEach(function() {
        return JoinGamePage.selectToken('top-hat');
      });

      it('should not allow joining yet', function() {
        expect(JoinGamePage.$joinBtn).to.have.prop('disabled', true);
      });
    });

    describe('when both a name and token is selected', function() {
      beforeEach(function() {
        return JoinGamePage.fillName('Player 1')
          .then(() => JoinGamePage.selectToken('top-hat'));
      });

      it('should allow joining', function() {
        expect(JoinGamePage.$joinBtn).to.have.text('Join Game');
        expect(JoinGamePage.$joinBtn).to.have.prop('disabled', false);
      });

      describe('and join game is clicked', function() {
        beforeEach(function() {
          return JoinGamePage.joinGame();
        });

        it('should show a loading indicator', function() {
          expect(JoinGamePage.isLoading).to.be.true;
        });

        it('should disable all inputs', function() {
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

      it('should show an "ask to join" message', function() {
        expect(JoinGamePage.$joinBtn).to.have.text('Ask to Join');
      });

      describe('when one of their names are filled in', function() {
        beforeEach(function() {
          return JoinGamePage.fillName('player 1');
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

      describe('when asking to join', function() {
        let pollId;

        beforeEach(function() {
          this.room.on('poll:new', ({ id }) => pollId = id);

          // join with the other player first...
          return this.room.constructor.connect(this.room.id)
            .then((room) => room.join('Player 1', 'top-hat'))
          // ...then ask to join via the UI
            .then(() => JoinGamePage.joinGame('Player 3', 'thimble'));
        });

        it('should indicate the other players are being asked', function() {
          expect(JoinGamePage.$joinBtn).to.have.text('Asking...');
        });

        it('should disable inputs', function() {
          expect(JoinGamePage.$nameInput).to.have.prop('disabled', true);
          expect(JoinGamePage.areTokensDisabled).to.be.true;
          expect(JoinGamePage.$joinBtn).to.have.prop('disabled', true);
        });

        describe('and the other player votes yes', function() {
          beforeEach(function() {
            return this.room.vote('top-hat', pollId, true);
          });

          it('should join the game', function() {
            expect(this.state.game.players).to.have.property('thimble');
            expect(this.state.app.player).to.equal('thimble');
          });

          it('should go to the game\'s home screen', function() {
            expect(this.location.pathname).to.equal(`/${this.room.id}`);
          });
        });

        describe('and the other player votes no', function() {
          beforeEach(function() {
            return this.room.vote('top-hat', pollId, false);
          });

          it.still('should leave inputs disabled', function() {
            expect(JoinGamePage.$nameInput).to.have.prop('disabled', true);
            expect(JoinGamePage.areTokensDisabled).to.be.true;
            expect(JoinGamePage.$joinBtn).to.have.prop('disabled', true);
          });

          it('should show an error', function() {
            expect(JoinGamePage.$joinBtn).to.have.text('Sorry, your friends hate you');
          });
        });
      });
    });
  });

  describe('with a non-existent room', function() {
    beforeEach(function() {
      return this.visit('/f4k3e/join');
    });

    it('should redirect to no room', function() {
      expect(this.location.pathname).to.equal('/join');
    });
  });
});
