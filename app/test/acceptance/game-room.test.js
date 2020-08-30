import expect from 'expect';
import { setupApplication } from '../helpers';

import GameRoomScreen from '../interactors/game-room';
import JoinGameScreen from '../interactors/join-game';

describe('Game Room Screen', () => {
  setupApplication(async function () {
    await this.grm.mock({ room: 't35tt' });
  });

  describe('without joining', () => {
    beforeEach(async () => {
      await GameRoomScreen().visit('/t35tt');
    });

    it('should redirect to the join game screen', async () => {
      await JoinGameScreen()
        .assert.exists()
        .assert.location('/t35tt/join')
        .assert.remains();
    });
  });

  describe('after joining', () => {
    beforeEach(async () => {
      await JoinGameScreen()
        .visit('/t35tt')
        .nameInput.type('Player 1')
        .tokenSelect.item('top-hat').click()
        .submitButton.click();
    });

    it('should tell the player they successfully joined', async () => {
      await GameRoomScreen()
        .assert.toast.type('message')
        .assert.toast.message('YOU joined the game');
    });

    describe('when another player asks to join', () => {
      let join;

      beforeEach(async function () {
        await GameRoomScreen().assert.exists();

        join = this.socket([
          ['room:connect', 't35tt'],
          ['game:join', 'PLAYER 2', 'automobile']
        ]);
      });

      it('should show the player a poll with voting buttons', async () => {
        await GameRoomScreen()
          .assert.toast.type('poll')
          .assert.toast.message('PLAYER 2 would like to join')
          .assert.toast.actions.exists();
      });

      describe('when voting yes', () => {
        beforeEach(async () => {
          await GameRoomScreen().toast.actions.clickPrimary();
        });

        it('should let the other player join', async () => {
          await expect(join).resolves.toBeDefined();
        });

        it('should tell the player that the other player has joined', async () => {
          await GameRoomScreen()
            .assert.toast.type('default')
            .assert.toast.message('PLAYER 2 joined the game');
        });
      });

      describe('when voting no', () => {
        beforeEach(async () => {
          await GameRoomScreen().toast.actions.clickSecondary();
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

      await this.grm.mock({
        room: 't35tt',
        players: [
          { token: 'top-hat' }
        ]
      });
    });

    describe('when reading persisted data', () => {
      beforeEach(async () => {
        await GameRoomScreen().visit('/t35tt');
      });

      it('should show a loading indicator', async () => {
        await GameRoomScreen().assert.loading();
      });

      it('should automatically connect to and join a room', async () => {
        await GameRoomScreen()
          .assert.exists()
          .assert.state('room', 't35tt')
          .assert.state('player.name', 'PLAYER 1')
          .assert.state('player.token', 'top-hat');
      });
    });

    describe('when the player has already joined', () => {
      beforeEach(async function () {
        await this.socket([
          ['room:connect', 't35tt'],
          ['game:join', 'PLAYER 1', 'top-hat']
        ]);

        await GameRoomScreen().visit('/t35tt');
      });

      it('should redirect to the join game screen', async () => {
        await JoinGameScreen()
          .assert.exists()
          .assert.location('/t35tt/join')
          .assert.remains();
      });
    });

    describe('when the player name is incorrect', () => {
      beforeEach(async function () {
        this.ls.data.player.name = 'PLAYER 2';
        await GameRoomScreen().visit('/t35tt');
      });

      it('should redirect to the join game screen', async () => {
        await JoinGameScreen()
          .assert.exists()
          .assert.location('/t35tt/join')
          .assert.remains();
      });
    });

    describe('when the room code is incorrect', () => {
      beforeEach(async function () {
        this.ls.data.room = 'wr0n6';
        await GameRoomScreen().visit('/t35tt');
      });

      it('should redirect to the join game screen', async () => {
        await JoinGameScreen()
          .assert.exists()
          .assert.location('/t35tt/join')
          .assert.remains();
      });
    });
  });
});
