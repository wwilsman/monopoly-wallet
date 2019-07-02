import expect from 'expect';
import { setupApplication } from '../helpers';

import FindRoomInteractor from '../interactors/find-room';
import JoinGameInteractor from '../interactors/join-game';

describe('FindRoomScreen', () => {
  const findRoom = new FindRoomInteractor();

  setupApplication(async () => {
    await findRoom.visit();
  });

  it('should display a join game heading', async () => {
    await findRoom
      .assert.exists()
      .assert.heading('JOIN GAME');
  });

  it('should display a room code input', async () => {
    await findRoom
      .assert.roomInput.exists()
      .assert.roomInput.label('Room Code');
  });

  it('should not show a back button', async () => {
    await findRoom
      .assert.exists()
      .assert.backBtn.not.exists()
      .assert.remains();
  });

  describe('and searching for an existing room', () => {
    const joinGame = new JoinGameInteractor();

    beforeEach(async () => {
      await findRoom
        .roomInput.type(findRoom.room.id);
    });

    it('should disable inputs and show a loading indicator', async () => {
      await findRoom
        .delaySocket(50)
        .submitBtn.click()
        .assert.roomInput.disabled()
        .assert.submitBtn.disabled()
        .assert.loading();
    });

    it('should go to the join game route for a game', async () => {
      await findRoom
        .submitBtn.click();
      await joinGame
        .assert.exists()
        .assert.location(`/${joinGame.room.id}/join`)
        .assert.state(({ app }) => {
          expect(app.room).toBe(joinGame.room.id);
        });
    });

    describe('then navigating back', () => {
      beforeEach(async () => {
        await findRoom
          .submitBtn.click();
        await joinGame
          .backBtn.click();
      });

      it('should go back', async () => {
        await findRoom
          .assert.exists()
          .assert.location('/join');
      });

      it('should clear the game room', async () => {
        await findRoom
          .assert.state(({ app }) => {
            expect(app.room).toBe('');
          });
      });
    });
  });

  describe('and searching for a non-existent room', () => {
    beforeEach(async () => {
      await findRoom
        .roomInput.type('f4k33')
        .submitBtn.click();
    });

    it('should not change routes', async () => {
      await findRoom
        .assert.exists()
        .assert.location('/join')
        .assert.remains();
    });

    it('should show an error message', async () => {
      await findRoom
        .assert.roomInput.error('Game Not Found');
    });
  });
});
