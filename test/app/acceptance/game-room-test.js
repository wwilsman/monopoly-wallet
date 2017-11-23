import { expect } from 'chai';
import { describe, beforeEach, it } from '../test-helpers';
import { describeApplication } from '../acceptance-helpers';

import GameRoomPage from '../pages/game-room';

describeApplication('GameRoomScreen', function() {
  describe('without joining', function() {
    beforeEach(function() {
      return this.visit(`/${this.room.id}`);
    });

    it.still('should redirect to the join game screen', function() {
      expect(this.location.pathname).to.equal(`/${this.room.id}/join`);
    });
  });

  describe('after joining', function() {
    beforeEach(function() {
      this.emit('room:connect', this.room.id);
      this.emit('game:join', 'Player 1', 'top-hat');

      return this.visit(`/${this.room.id}`, () => {
        expect(GameRoomPage.$root).to.exist;
      });
    });

    it('should show the room code', function() {
      expect(GameRoomPage.room).to.equal(this.room.id);
    });

    it('should tell the player they successfully joined', function() {
      expect(GameRoomPage.toast(0).type).to.equal('message');
      expect(GameRoomPage.toast(0).message).to.match(/you joined/i);
    });

    describe('when another player asks to join', function() {
      let poll;

      beforeEach(function() {
        poll = this.room.poll(
          this.room.notice('player.ask-to-join', {
            player: { name: 'Player 2' }
          })
        );
      });

      it('should show the player a poll', function() {
        expect(GameRoomPage.toast(1).type).to.equal('poll');
        expect(GameRoomPage.toast(1).message).to.match(/player 2 .* join/i);
      });

      it('should show voting buttons', function() {
        expect(GameRoomPage.toast(1).$actions).to.exist;
      });

      describe('when voting yes', function() {
        beforeEach(function() {
          poll.then((result) => result && (
            this.room.join('Player 2', 'automobile')
          ));

          return GameRoomPage.toast(1).click(0);
        });

        it('should let the other player join', function() {
          return expect(poll).to.eventually.be.true;
        });

        it('should tell the player that the other player has joined', function() {
          expect(GameRoomPage.toast(1).type).to.equal('default');
          expect(GameRoomPage.toast(1).message).to.match(/player 2 joined/i);
        });
      });

      describe('when voting no', function() {
        beforeEach(function() {
          return GameRoomPage.toast(1).click(1);
        });

        it('should not let the other player join', function() {
          return expect(poll).to.eventually.be.false;
        });
      });
    });
  });
});
