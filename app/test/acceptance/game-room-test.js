import { expect } from 'chai';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { describeApplication, mockGame } from '../helpers';

import GameRoomPage from '../pages/game-room';

describeApplication('GameRoomScreen', function() {
  describe('without joining', function() {
    beforeEach(function() {
      return this.visit(`/${this.room.id}`);
    });

    it.always('should redirect to the join game screen', function() {
      expect(this.location.pathname).to.equal(`/${this.room.id}/join`);
    });
  });

  describe('after joining', function() {
    beforeEach(function() {
      this.emit('room:connect', this.room.id);
      this.emit('game:join', 'Player 1', 'top-hat');

      return this.visit(`/${this.room.id}`).once(() => {
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
        expect(GameRoomPage.toast(1).hasActions).to.be.true;
      });

      describe('when voting yes', function() {
        beforeEach(function() {
          poll.then((result) => result && (
            this.room.join('Player 2', 'automobile')
          ));

          return GameRoomPage.interaction
            .once(() => !!GameRoomPage.toast(1));
        });

        beforeEach(function() {
          return GameRoomPage.toast(1).clickPrimary();
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
          return GameRoomPage.interaction
            .once(() => !!GameRoomPage.toast(1));
        });

        beforeEach(function() {
          return GameRoomPage.toast(1).clickSecondary();
        });

        it('should not let the other player join', function() {
          return expect(poll).to.eventually.be.false;
        });
      });
    });
  });

  describe('automatically connecting and joining', function() {
    describe('when reading persisted data', function() {
      beforeEach(function() {
        this.localStorage.app = {
          room: this.room.id,
          player: {
            name: 'Player 1',
            token: 'top-hat'
          }
        };

        return this.visit(`/${this.room.id}`).once(() => {
          expect(GameRoomPage.$root).to.exist;
        });
      });

      it('should show a loading indicator', function() {
        expect(GameRoomPage.isLoading).to.be.true;
      });

      it('should automatically connect to and join a room', function() {
        expect(this.state.app.room).to.equal(this.room.id);
        expect(this.state.app.player).to.deep.equal({
          name: 'Player 1',
          token: 'top-hat'
        });
      });
    });

    describe('when reading incorrect persisted data', function() {
      mockGame({ state: {
        players: [{ token: 'top-hat' }]
      }});

      beforeEach(function() {
        return this.room.constructor.connect(this.room.id)
          .then((room) => room.join('Player 1', 'top-hat'));
      });

      beforeEach(function() {
        this.localStorage.app = {
          room: this.room.id,
          player: {
            name: 'Player 1',
            token: 'top-hat'
          }
        };

        return this.visit(`/${this.room.id}`).once(() => {
          expect(GameRoomPage.$root).to.exist;
        });
      });

      it('should redirect to the join game screen', function() {
        expect(this.location.pathname).to.equal(`/${this.room.id}/join`);
      });
    });
  });
});
