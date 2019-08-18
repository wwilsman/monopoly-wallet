import expect from 'expect';
import { setupApplication } from '../helpers';

import GameRoomInteractor from '../interactors/game-room';
import JoinGameInteractor from '../interactors/join-game';

describe('GameRoomScreen', () => {
  const joinGame = new JoinGameInteractor();
  const gameRoom = new GameRoomInteractor();

  setupApplication(async function () {
    await this.grm.mock({ room: 't35tt' });
  });

  describe('without joining', () => {
    beforeEach(async () => {
      await gameRoom.visit('/t35tt');
    });

    it('should redirect to the join game screen', async () => {
      await joinGame
        .assert.exists()
        .assert.location('/t35tt/join')
        .assert.remains();
    });
  });

  describe('after joining', () => {
    beforeEach(async () => {
      await joinGame.visit('/t35tt')
        .nameInput.type('Player 1')
        .tokens.item('top-hat').click()
        .submitBtn.click();
    });

    it('should tell the player they successfully joined', async () => {
      await gameRoom
        .assert.toast(0).type('message')
        .assert.toast(0).message('YOU joined the game')
        .percySnapshot('joined the game');
    });

    describe('when another player asks to join', () => {
      let join;

      beforeEach(async function () {
        await gameRoom.assert.exists();

        join = this.socket([
          ['room:connect', 't35tt'],
          ['game:join', 'PLAYER 2', 'automobile']
        ]);
      });

      it('should show the player a poll with voting buttons', async () => {
        await gameRoom.toast(1).only()
          .assert.type('poll')
          .assert.message('PLAYER 2 would like to join')
          .assert.actions.exists();
        await gameRoom
          .percySnapshot('joining requested');
      });

      describe('when voting yes', () => {
        beforeEach(async () => {
          await gameRoom.toast(1).actions.primary.click();
        });

        it('should let the other player join', async () => {
          await expect(join).resolves.toBeDefined();
        });

        it('should tell the player that the other player has joined', async () => {
          await gameRoom.toast(1).only()
            .assert.type('default')
            .assert.message('PLAYER 2 joined the game');
          await gameRoom
            .percySnapshot('others joined');
        });
      });

      describe('when voting no', () => {
        beforeEach(async () => {
          await gameRoom.toast(1).actions.secondary.click();
        });

        it('should not let the other player join', async () => {
          await expect(join).rejects.toThrow('Sorry, your friends hate you');
        });
      });
    });
  });

  describe('automatically connecting and joining', () => {
    beforeEach(async function () {
      this.ls.data.room = 't35tt';
      this.ls.data.player = { name: 'PLAYER 1', token: 'top-hat' };
    });

    describe('when reading persisted data', () => {
      beforeEach(async () => {
        await gameRoom.visit('/t35tt');
      });

      it('should show a loading indicator', async () => {
        await gameRoom.assert.loading();
      });

      it('should automatically connect to and join a room', async () => {
        await gameRoom
          .assert.exists()
          .assert.state(state => {
            expect(state).toHaveProperty('room', 't35tt');
            expect(state).toHaveProperty('player', { name: 'PLAYER 1', token: 'top-hat' });
          });
      });
    });

    describe('when reading incorrect persisted data', () => {
      beforeEach(async function () {
        await this.socket([
          ['room:connect', 't35tt'],
          ['game:join', 'PLAYER 1', 'top-hat']
        ]);

        this.ls.data.player.name = 'PLAYER 2';
        await gameRoom.visit('/t35tt');
      });

      it('should redirect to the join game screen', async () => {
        await joinGame
          .assert.exists()
          .assert.location('/t35tt/join')
          .assert.remains();
      });
    });
  });
});
