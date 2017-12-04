import { expect } from 'chai';
import { describe, beforeEach, it } from '../test-helpers';
import { describeApplication, mockGame } from '../acceptance-helpers';

import JoinGamePage from '../pages/join-game';

describeApplication('JoinGameScreen', function() {
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
      expect(JoinGamePage.$backButton).to.not.exist;
    });

    describe('when only a name is provided', function() {
      beforeEach(function() {
        return JoinGamePage.fillName('Player 1');
      });

      it('should not allow joining yet', function() {
        expect(JoinGamePage.$submit).to.have.prop('disabled', true);
      });
    });

    describe('when only a token is selected', function() {
      beforeEach(function() {
        return JoinGamePage.selectToken('top-hat');
      });

      it('should not allow joining yet', function() {
        expect(JoinGamePage.$submit).to.have.prop('disabled', true);
      });
    });

    describe('when both a name and token is selected', function() {
      beforeEach(function() {
        return JoinGamePage.fillName('Player 1')
          .then(() => JoinGamePage.selectToken('top-hat'));
      });

      it('should allow joining', function() {
        expect(JoinGamePage.$submit).to.have.text('Join Game');
        expect(JoinGamePage.$submit).to.have.prop('disabled', false);
      });

      describe('and join game is clicked', function() {
        beforeEach(function() {
          return JoinGamePage.joinGame();
        });

        it('should show a loading indicator', function() {
          expect(JoinGamePage.isLoading).to.be.true;
        });

        it('should disable all inputs', function() {
          let tokenCount = this.state.config.playerTokens.length;
          expect(JoinGamePage.$nameInput).to.have.prop('disabled', true);
          expect(JoinGamePage.$disabledTokens).to.have.lengthOf(tokenCount);
          expect(JoinGamePage.$submit).to.have.prop('disabled', true);
        });

        it('should join the game', function() {
          expect(this.state.game.players).to.have.property('top-hat');
          expect(this.state.app.player).to.deep.equal({
            name: 'PLAYER 1',
            token: 'top-hat'
          });
        });

        it('should go to the game\'s home screen', function() {
          expect(this.location.pathname).to.equal(`/${this.room.id}`);
        });
      });
    });

    describe('after joining a game', function() {
      beforeEach(function() {
        return JoinGamePage.joinGame('Player 1', 'top-hat', () => {
          expect(this.location.pathname).to.equal(`/${this.room.id}`);
        });
      });

      it('should persist app data to local storage', function() {
        expect(this.localStorage.app).to.have.property('room', this.room.id);
        expect(this.localStorage.app).to.have.property('player')
          .that.deep.equals({ name: 'PLAYER 1', token: 'top-hat' });
      });

      it('should persist player data to the location state', function() {
        expect(this.location.state).to.have.property('player')
          .that.deep.equals({ name: 'PLAYER 1', token: 'top-hat' });
      });

      describe('then navigating back', function() {
        beforeEach(function() {
          return this.goBack(() => {
            expect(JoinGamePage.$root).to.exist;
          });
        });

        it('should disconnect the player', function() {
          expect(this.state.app.player).to.be.null;
        });

        it('should clear the persisted player from local storage', function() {
          expect(this.localStorage.app).to.have.property('room', this.room.id);
          expect(this.localStorage.app).to.have.property('player').that.is.null;
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
        expect(JoinGamePage.$submit).to.have.text('Ask to Join');
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
            expect(JoinGamePage.$disabledTokens).to.have.lengthOf(2);
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
          expect(JoinGamePage.$submit).to.have.text('Asking...');
        });

        it('should disable inputs', function() {
          let tokenCount = this.state.config.playerTokens.length;
          expect(JoinGamePage.$nameInput).to.have.prop('disabled', true);
          expect(JoinGamePage.$disabledTokens).to.have.lengthOf(tokenCount);
          expect(JoinGamePage.$submit).to.have.prop('disabled', true);
        });

        describe('and the other player votes yes', function() {
          beforeEach(function() {
            return this.room.vote('top-hat', pollId, true);
          });

          it('should join the game', function() {
            expect(this.state.game.players).to.have.property('thimble');
            expect(this.state.app.player).to.deep.equal({
              name: 'PLAYER 3',
              token: 'thimble'
            });
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
            let tokenCount = this.state.config.playerTokens.length;
            expect(JoinGamePage.$nameInput).to.have.prop('disabled', true);
            expect(JoinGamePage.$disabledTokens).to.have.lengthOf(tokenCount);
            expect(JoinGamePage.$submit).to.have.prop('disabled', true);
          });

          it('should show an error', function() {
            expect(JoinGamePage.$submit).to.have.text('Sorry, your friends hate you');
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
