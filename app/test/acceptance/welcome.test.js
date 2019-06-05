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

  it('shows the app name', async () => {
    await welcome
      .assert.exists()
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

    it('should create a new game', async () => {
      await joinGame
        .assert.state(({ app }) => {
          expect(app.room).toBeDefined();
        });
    });

    it('should go to the join game route for a room', async () => {
      await joinGame
        .assert.exists()
        .assert.location(path => {
          expect(path).toEqual(`/${joinGame.state.app.room}/join`);
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
          .assert.state(({ app, game }) => {
            expect(app.room).toBe('');
            expect(game).toBeNull();
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

      it('should clear the game ', async () => {
        await welcome
          .assert.state(({ app, game }) => {
            expect(app.room).toBe('');
            expect(game).toBeNull();
          });
      });
    });
  });
});
