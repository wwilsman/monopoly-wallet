import expect from 'expect';
import { setupApplication } from '../helpers';

import GameRoomInteractor from '../interactors/game-room';
import JoinGameInteractor from '../interactors/join-game';

describe('GameRoomScreen', () => {
  const joinGame = new JoinGameInteractor();
  const gameRoom = new GameRoomInteractor();

  setupApplication();

  describe('without joining', () => {
    beforeEach(async () => {
      await gameRoom.visit();
    });

    it('should redirect to the join game screen', async () => {
      await joinGame
        .assert.exists()
        .assert.location(`/${joinGame.room.id}/join`)
        .assert.remains();
    });
  });

  describe('after joining', () => {
    beforeEach(async () => {
      await joinGame.visit()
        .nameInput.type('Player 1')
        .tokens.item('top-hat').click()
        .submitBtn.click();
    });

    it('should show the room code', async () => {
      await gameRoom
        .assert.roomId(gameRoom.room.id.toUpperCase());
    });

    it('should show the player name and token', async () => {
      await gameRoom
        .assert.heading.text('PLAYER 1')
        .assert.heading.icon('top-hat');
    });

    it('should tell the player they successfully joined', async () => {
      await gameRoom
        .assert.toast(0).type('message')
        .assert.toast(0).message('YOU joined the game');
    });

    describe('when another player asks to join', () => {
      let poll;

      beforeEach(async () => {
        poll = gameRoom.room.poll(
          gameRoom.room.notice('player.ask-to-join', {
            player: { name: 'PLAYER 2' }
          })
        );
      });

      it('should show the player a poll with voting buttons', async () => {
        await gameRoom.toast(1).only()
          .assert.type('poll')
          .assert.message('PLAYER 2 would like to join')
          .assert.actions.exists();
      });

      describe('when voting yes', () => {
        beforeEach(async () => {
          poll.then((result) => result && (
            gameRoom.room.join('PLAYER 2', 'automobile')
          ));

          await gameRoom.toast(1).actions.primary.click();
        });

        it('should let the other player join', async () => {
          await expect(poll).resolves.toBe(true);
        });

        it('should tell the player that the other player has joined', async () => {
          await gameRoom.toast(1).only()
            .assert.type('default')
            .assert.message('PLAYER 2 joined the game');
        });
      });

      describe('when voting no', () => {
        beforeEach(async () => {
          await gameRoom.toast(1).actions.secondary.click();
        });

        it('should not let the other player join', async () => {
          await expect(poll).resolves.toBe(false);
        });
      });
    });
  });

  describe('automatically connecting and joining', () => {
    describe('when reading persisted data', () => {
      beforeEach(async () => {
        localStorage.data.app = {
          room: gameRoom.room.id,
          player: { name: 'PLAYER 1', token: 'top-hat' }
        };

        await gameRoom.visit();
      });

      it('should show a loading indicator', async () => {
        await gameRoom.assert.loading();
      });

      it('should automatically connect to and join a room', async () => {
        await gameRoom
          .assert.exists()
          .assert.state(({ app }) => {
            expect(app.room).toBe(gameRoom.room.id);
            expect(app.player).toEqual({ name: 'PLAYER 1', token: 'top-hat' });
          });
      });
    });

    describe('when reading incorrect persisted data', () => {
      beforeEach(async () => {
        await gameRoom
          .room.constructor.connect(gameRoom.room.id)
          .then(room => room.join('PLAYER 1', 'top-hat'));

        localStorage.data.app = {
          room: gameRoom.room.id,
          player: {
            name: 'PLAYER 2',
            token: 'top-hat'
          }
        };

        await gameRoom.visit();
      });

      it('should redirect to the join game screen', async () => {
        await joinGame
          .assert.exists()
          .assert.location(`/${joinGame.room.id}/join`)
          .assert.remains();
      });
    });
  });
});
