import { setupApplication } from '../helpers';
import FindRoomScreen from '../interactors/find-room';
import JoinGameScreen from '../interactors/join-game';

describe('Find Room Screen', () => {
  setupApplication(async () => {
    await FindRoomScreen().visit();
  });

  it('shows the find room screen', async () => {
    await FindRoomScreen().assert.exists();
  });

  it('should not show a back button', async () => {
    await FindRoomScreen()
      .assert.exists()
      .assert.backButton.not.exists()
      .assert.remains();
  });

  it('should allow typing into the room input', async () => {
    await FindRoomScreen()
      .roomInput.type('g4m33')
      .assert.roomInput.value('G4M33');
  });

  describe('searching for an existing room', () => {
    beforeEach(async () => {
      await FindRoomScreen()
        .mock({ room: 't35tt' })
        .roomInput.type('t35tt');
    });

    it('should disable inputs and show a loading indicator', async () => {
      FindRoomScreen().grm.wss.latency(50);

      await FindRoomScreen()
        .submitButton.click()
        .assert.roomInput.disabled()
        .assert.submitButton.disabled()
        .assert.loading();
    });

    it('should go to the join game route for a game', async () => {
      await FindRoomScreen()
        .submitButton.click();

      await JoinGameScreen()
        .assert.exists()
        .assert.location('/t35tt/join')
        .assert.state('room', 't35tt')
        .assert.roomCode('T35TT')
        .assert.remains();
    });

    describe('then navigating back', () => {
      beforeEach(async () => {
        await FindRoomScreen()
          .submitButton.click();

        await JoinGameScreen()
          .backButton.click();
      });

      it('should go back and disconnect from the room', async () => {
        await FindRoomScreen()
          .assert.exists()
          .assert.location('/join')
          .assert.not.state('room')
          .assert.remains();
      });
    });
  });

  describe('and searching for a non-existent room', () => {
    beforeEach(async () => {
      await FindRoomScreen()
        .roomInput.type('f4k33')
        .submitButton.click();
    });

    it('should not change routes', async () => {
      await FindRoomScreen()
        .assert.exists()
        .assert.location('/join')
        .assert.remains();
    });

    it('should show an error message', async () => {
      await FindRoomScreen()
        .assert.roomInput.error('Game Not Found');
    });
  });
});
