import expect from 'expect';
import { setupApplication } from '../helpers';

import FindRoomInteractor from '../interactors/find-room';
import JoinGameInteractor from '../interactors/join-game';

describe('FindRoomScreen', () => {
  const findRoom = new FindRoomInteractor();

  setupApplication(async () => {
    await findRoom.visit();
  });

  it('shows the find room screen', async () => {
    await findRoom
      .assert.exists()
      .percySnapshot();
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

  it('should allow typing into the room input', async () => {
    await findRoom
      .roomInput.type('g4m33')
      .percySnapshot('with a room');
  });

  describe('and searching for an existing room', () => {
    const joinGame = new JoinGameInteractor();

    beforeEach(async function () {
      await this.grm.mock({ room: 't35tt' });
      await findRoom.roomInput.type('t35tt');
    });

    it('should disable inputs and show a loading indicator', async function () {
      this.grm.wss.timing(50);

      await findRoom
        .submitBtn.click()
        .assert.roomInput.disabled()
        .assert.submitBtn.disabled()
        .assert.loading()
        .percySnapshot('loading');
    });

    it('should go to the join game route for a game', async () => {
      await findRoom
        .submitBtn.click();
      await joinGame
        .assert.exists()
        .assert.location('/t35tt/join')
        .assert.roomCode('T35TT')
        .assert.state(state => {
          expect(state).toHaveProperty('connected', true);
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

      it('should disconnect from the game', async () => {
        await findRoom.assert.state(state => {
          expect(state).not.toHaveProperty('connected');
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
        .assert.roomInput.error('Game Not Found')
        .percySnapshot('game not found');
    });
  });
});
