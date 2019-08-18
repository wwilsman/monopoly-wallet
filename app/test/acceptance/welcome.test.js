import expect from 'expect';
import { setupApplication } from '../helpers';

import WelcomeInteractor from '../interactors/welcome';
import FindRoomInteractor from '../interactors/find-room';
import JoinGameInteractor from '../interactors/join-game';

describe('WelcomeScreen', () => {
  const welcome = new WelcomeInteractor();

  setupApplication(async () => {
    await welcome.visit();
  });

  it('shows the welcome screen', async () => {
    await welcome
      .assert.exists()
      .percySnapshot();
  });

  it('shows the app name', async () => {
    await welcome
      .assert.title('MONOPOLY\nWALLET');
  });

  it('has a new game button', async () => {
    await welcome
      .assert.newGameBtn.exists()
      .assert.newGameBtn.text('New Game');
  });

  it('has a join game button', async () => {
    await welcome
      .assert.joinGameBtn.exists()
      .assert.joinGameBtn.text('Join Game');
  });

  describe('visiting a non-existent route', () => {
    beforeEach(async () => {
      await welcome.visit('/404');
    });

    it('should redirect back to welcome', async () => {
      await welcome
        .assert.exists()
        .assert.location('/')
        .assert.remains();
    });
  });

  describe('clicking the new game button', () => {
    const joinGame = new JoinGameInteractor();

    beforeEach(async () => {
      await welcome.newGameBtn.click();
    });

    it('should create and connect to a new game', async () => {
      let room = await welcome.get('state.room');

      await joinGame
        .assert.exists()
        .assert.location(`/${room}/join`)
        .assert.roomCode(room.toUpperCase())
        .assert.state(state => {
          expect(state).toHaveProperty('connected', true);
        });
    });

    describe('then navigating back', () => {
      beforeEach(async () => {
        await joinGame.backBtn.click();
      });

      it('should go back', async () => {
        await welcome
          .assert.exists()
          .assert.location('/');
      });

      it('should disconnect from the game', async () => {
        await welcome
          .assert.state(state => {
            expect(state).not.toHaveProperty('room');
          });
      });
    });
  });

  describe('clicking the join game button', () => {
    const findRoom = new FindRoomInteractor();

    beforeEach(async () => {
      await welcome.joinGameBtn.click();
    });

    it('should go to the find room screen', async () => {
      await findRoom
        .assert.exists()
        .assert.location('/join');
    });

    describe('then navigating back', () => {
      beforeEach(async () => {
        await findRoom.goBack();
      });

      it('should go back', async () => {
        await welcome
          .assert.exists()
          .assert.location('/');
      });
    });
  });
});
