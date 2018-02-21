import { expect } from 'chai';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { describeApplication, mockGame } from '../acceptance-helpers';

import JoinGamePage from '../pages/join-game';

describeApplication('JoinGameScreen', function() {
  describe('with a specific room', function() {
    beforeEach(function() {
      return this.visit(`/${this.room.id}/join`).once(() => {
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
      expect(JoinGamePage.tokens()).to.have.lengthOf(tokenCount);
      expect(JoinGamePage.tokensLabel).to.equal('Select a token');
    });

    it.always('should not show a back button', function() {
      expect(JoinGamePage.hasBackBtn).to.be.false;
    });

    describe('when only a name is provided', function() {
      beforeEach(function() {
        return JoinGamePage.fillName('Player 1');
      });

      it.always('should not allow joining yet', function() {
        expect(JoinGamePage.$submit).to.have.property('disabled', true);
      });
    });

    describe('when only a token is selected', function() {
      beforeEach(function() {
        return JoinGamePage.tokens(0).click();
      });

      it.always('should not allow joining yet', function() {
        expect(JoinGamePage.$submit).to.have.property('disabled', true);
      });
    });

    describe('when both a name and token is selected', function() {
      beforeEach(function() {
        return JoinGamePage
          .fillName('Player 1')
          .append(JoinGamePage.tokens(6).click());
      });

      it('should allow joining', function() {
        expect(JoinGamePage.$submit).to.have.text('Join Game');
        expect(JoinGamePage.$submit).to.have.property('disabled', false);
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
          expect(JoinGamePage.$nameInput).to.have.property('disabled', true);
          expect(JoinGamePage.disabledTokens).to.equal(tokenCount);
          expect(JoinGamePage.$submit).to.have.property('disabled', true);
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
        return JoinGamePage.joinGame('Player 1', 'top-hat').once(() => {
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
          return this.goBack().once(() => {
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
        expect(JoinGamePage.tokens(6).isDisabled).to.be.true; // 6 => top-hat
        expect(JoinGamePage.tokens(0).isDisabled).to.be.true; // 0 => automobile
      });

      it('should show an "ask to join" message', function() {
        expect(JoinGamePage.$submit).to.have.text('Ask to Join');
      });

      describe('when one of their names are filled in', function() {
        beforeEach(function() {
          return JoinGamePage.fillName('player 1');
        });

        it('should enable a used token with the token player\'s name', function() {
          expect(JoinGamePage.tokens(6).isDisabled).to.be.false;
          expect(JoinGamePage.tokens(0).isDisabled).to.be.true;
        });

        describe('and they are playing', function() {
          beforeEach(function() {
            return this.room.constructor.connect(this.room.id)
              .then((room) => room.join('Player 1', 'top-hat'));
          });

          it('should not enable their token with their name', function() {
            expect(JoinGamePage.disabledTokens).to.equal(2);
            expect(JoinGamePage.tokens(6).isDisabled).to.be.true;
            expect(JoinGamePage.tokens(0).isDisabled).to.be.true;
          });
        });
      });

      describe('when asking to join', function() {
        let pollId;

        beforeEach(function() {
          this.room.on('poll:new', ({ id }) => pollId = id);

          // join with the other player first...
          return this.room.constructor.connect(this.room.id)
            .then((room) => room.join('Player 1', 'top-hat'));
        });

        beforeEach(function() {
          // ...then ask to join via the UI
          return JoinGamePage.joinGame('Player 3', 'thimble');
        });

        it('should indicate the other players are being asked', function() {
          expect(JoinGamePage.$submit).to.have.text('Asking...');
        });

        it('should disable inputs', function() {
          let tokenCount = this.state.config.playerTokens.length;
          expect(JoinGamePage.$nameInput).to.have.property('disabled', true);
          expect(JoinGamePage.disabledTokens).to.equal(tokenCount);
          expect(JoinGamePage.$submit).to.have.property('disabled', true);
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

          it.always('should leave inputs disabled', function() {
            let tokenCount = this.state.config.playerTokens.length;
            expect(JoinGamePage.$nameInput).to.have.property('disabled', true);
            expect(JoinGamePage.disabledTokens).to.equal(tokenCount);
            expect(JoinGamePage.$submit).to.have.property('disabled', true);
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
