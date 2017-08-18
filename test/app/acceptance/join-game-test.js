import { expect } from 'chai';
import { describe, beforeEach, it } from '../test-helpers';
import { describeApplication, mockGame } from '../acceptance-helpers.js';

import JoinGamePage from '../pages/join-game';

describeApplication('join game screen', function() {
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

      it('should go to the join game route for a game', function() {
        expect(this.location.pathname).to.equal(`/${this.room.id}/join`);
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
      const tokenCount = this.state.game.config.playerTokens.length;
      expect(JoinGamePage.$tokens).to.have.lengthOf(tokenCount);
      expect(JoinGamePage.tokensLabel).to.equal('Select a token');
    });

    describe('when only a name is provided', function() {
      beforeEach(function() {
        JoinGamePage.fillName('Player 1');
      });

      it('should not allow joining yet', function() {
        expect(JoinGamePage.$joinBtn).to.have.attr('disabled');
      });
    });

    describe('when only a token is selected', function() {
      beforeEach(function() {
        JoinGamePage.selectToken('top-hat');
      });

      it('should not allow joining yet', function() {
        expect(JoinGamePage.$joinBtn).to.have.attr('disabled');
      });
    });

    describe('when both a name and token is selected', function() {
      beforeEach(function() {
        JoinGamePage.fillName('Player 1');
        JoinGamePage.selectToken('top-hat');
      });

      it('should allow joining', function() {
        expect(JoinGamePage.$joinBtn).to.not.have.attr('disabled');
      });

      describe('and join game is clicked', function() {
        beforeEach(function() {
          JoinGamePage.joinGame();
        });

        it('should join the game', function() {
          expect(this.state.game.state.players).to.have.property('top-hat');
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
        expect(JoinGamePage.$token('top-hat')).to.have.attr('disabled');
        expect(JoinGamePage.$token('automobile')).to.have.attr('disabled');
      });

      describe('when one of their names are filled in', function() {
        beforeEach(function() {
          JoinGamePage.fillName('player 1');
        });

        it('should enable a used token with the token player\'s name', function() {
          expect(JoinGamePage.$token('top-hat')).to.not.have.attr('disabled');
          expect(JoinGamePage.$token('automobile')).to.have.attr('disabled');
        });

        describe('and they are playing', function() {
          beforeEach(function() {
            return this.room.constructor.connect(this.room.id)
              .then((room) => room.join('Player 1', 'top-hat'));
          });

          it('should not enable their token with their name', function() {
            expect(JoinGamePage.$token('top-hat')).to.have.attr('disabled');
            expect(JoinGamePage.$token('automobile')).to.have.attr('disabled');
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
