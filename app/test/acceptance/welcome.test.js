import { setupApplication } from '../helpers';
import WelcomeScreen from '../interactors/welcome';
import FindRoomScreen from '../interactors/find-room';
import JoinGameScreen from '../interactors/join-game';

describe('Welcome Screen', () => {
  setupApplication(async () => {
    await WelcomeScreen().visit();
  });

  it('shows the welcome screen', async () => {
    await WelcomeScreen().assert.exists();
  });

  describe('visiting a non-existent route', () => {
    beforeEach(async () => {
      await WelcomeScreen().visit('/404');
    });

    it('should redirect back to the welcome screen', async () => {
      await WelcomeScreen()
        .assert.exists()
        .assert.location('/')
        .assert.remains();
    });
  });

  describe('clicking the new game button', () => {
    beforeEach(async () => {
      await WelcomeScreen().clickNewGame();
    });

    it('should create and connect to a new game', async () => {
      let room = await JoinGameScreen().get('room');

      await JoinGameScreen()
        .assert.exists()
        .assert.location(`/${room}/join`)
        .assert.roomCode(room.toUpperCase())
        .assert.state('connected');
    });

    describe('then navigating back', () => {
      beforeEach(async () => {
        await JoinGameScreen().backButton.click();
      });

      it('should go back and disconnect from the game', async () => {
        await WelcomeScreen()
          .assert.exists()
          .assert.location('/')
          .assert.not.state('room')
          .assert.remains();
      });
    });
  });

  describe('clicking the join game button', () => {
    beforeEach(async () => {
      await WelcomeScreen().clickJoinGame();
    });

    it('should go to the find room screen', async () => {
      await FindRoomScreen()
        .assert.exists()
        .assert.location('/join')
        .assert.remains();
    });

    describe('then navigating back', () => {
      beforeEach(async () => {
        await FindRoomScreen().backButton.click();
      });

      it('should go back', async () => {
        await WelcomeScreen()
          .assert.exists()
          .assert.location('/')
          .assert.remains();
      });
    });
  });
});
