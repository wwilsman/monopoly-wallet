import { setupApplication } from '../helpers';

import JoinGameScreen from '../interactors/join-game';
import GameRoomScreen from '../interactors/game-room';

describe('Join Game Screen', () => {
  setupApplication(async () => {
    await JoinGameScreen().mock({ room: 't35tt' });
  });

  describe('with a specific room', () => {
    beforeEach(async () => {
      await JoinGameScreen().visit();
    });

    it('should display the join game screen', async () => {
      await JoinGameScreen()
        .assert.exists()
        .assert.not.loading();
    });

    it('should display the room code', async () => {
      await JoinGameScreen()
        .assert.roomCode('T35TT');
    });

    it('should display a name input field', async () => {
      await JoinGameScreen()
        .assert.nameInput.exists()
        .assert.nameInput.label('Your Name');
    });

    it('should display a token select field', async () => {
      let { length } = await JoinGameScreen().get('config.playerTokens');
      await JoinGameScreen().assert.tokenSelect.item().count(length);
    });

    it('should not show a back button', async () => {
      await JoinGameScreen()
        .assert.exists()
        .assert.backButton.not.exists()
        .assert.remains();
    });

    describe('when only a name is provided', () => {
      beforeEach(async () => {
        await JoinGameScreen()
          .nameInput.type('Player 1');
      });

      it('should not allow joining yet', async () => {
        await JoinGameScreen()
          .assert.nameInput.value('PLAYER 1')
          .assert.submitButton.disabled()
          .assert.remains();
      });
    });

    describe('when only a token is selected', () => {
      beforeEach(async () => {
        await JoinGameScreen()
          .tokenSelect.item('top-hat').click();
      });

      it('should not allow joining yet', async () => {
        await JoinGameScreen()
          .assert.tokenSelect.item('top-hat').selected()
          .assert.submitButton.disabled()
          .assert.remains();
      });
    });

    describe('when both a name and token is selected', () => {
      beforeEach(async () => {
        await JoinGameScreen()
          .nameInput.type('Player 1')
          .tokenSelect.item('top-hat').click();
      });

      it('should allow joining', async () => {
        await JoinGameScreen()
          .assert.submitButton.text('Join Game')
          .assert.submitButton.not.disabled();
      });

      describe('and join game is clicked', () => {
        it('should disable all inputs', async () => {
          JoinGameScreen().grm.wss.latency(5000);

          await JoinGameScreen()
            .submitButton.click()
            .assert.nameInput.disabled()
            .assert.tokenSelect.disabled()
            .assert.submitButton.disabled()
            .assert.loading();
        });

        it('should join the game', async () => {
          await JoinGameScreen()
            .submitButton.click()
            .assert.state('player.name', 'PLAYER 1')
            .assert.state('players.top-hat.name', 'PLAYER 1');
        });

        it('should go to the game\'s home screen', async () => {
          await JoinGameScreen()
            .submitButton.click()
            .assert.location('/t35tt')
            .assert.remains();
        });
      });
    });

    describe('after joining a game', () => {
      beforeEach(async () => {
        await JoinGameScreen()
          .nameInput.type('Player 1')
          .tokenSelect.item('top-hat').click()
          .submitButton.click();
      });

      it('should go to the game room screen', async () => {
        await GameRoomScreen()
          .assert.exists()
          .assert.roomCode('T35TT');
      });

      it('should persist app data to local storage', async () => {
        await GameRoomScreen()
          .assert.localstorage('room', 't35tt')
          .assert.localstorage('player.name', 'PLAYER 1')
          .assert.localstorage('player.token', 'top-hat');
      });

      it('should persist player data to the location state', async () => {
        await GameRoomScreen().assert.context(({ history }) => {
          let { name, token } = history.location.state.player;

          if (name !== 'PLAYER 1' || token !== 'top-hat') {
            throw new Error('correct player data was not persisted');
          }
        });
      });

      describe('then navigating back', () => {
        beforeEach(async () => {
          await GameRoomScreen()
            .assert.exists()
            .assert.location('/t35tt')
            .goBack();
        });

        it('should go back to the join game screen', async () => {
          await JoinGameScreen()
            .assert.location('/t35tt/join');
        });

        it('should disconnect the player, but remain connected to the game', async () => {
          await JoinGameScreen()
            .assert.state('room', 't35tt')
            .assert.not.state('player');
        });

        it('should clear the persisted player from local storage', async () => {
          await JoinGameScreen()
            .assert.not.localstorage('room')
            .assert.not.localstorage('player');
        });
      });
    });

    describe('with other players', () => {
      beforeEach(async () => {
        await JoinGameScreen().mock({
          room: 't35tt',
          players: [
            { token: 'top-hat' },
            { token: 'automobile' }
          ]
        });
      });

      it('should prevent selecting used tokens', async () => {
        await JoinGameScreen()
          .assert.tokenSelect.item('top-hat').disabled()
          .assert.tokenSelect.item('automobile').disabled();
      });

      it('should show an "ask to join" message', async () => {
        await JoinGameScreen()
          .assert.submitButton.text('Ask to Join');
      });

      describe('when one of their names are filled in', () => {
        beforeEach(async () => {
          await JoinGameScreen()
            .nameInput.type('Player 1');
        });

        it('should enable a used token with the token player\'s name', async () => {
          await JoinGameScreen()
            .assert.tokenSelect.item('top-hat').not.disabled()
            .assert.tokenSelect.item('automobile').disabled();
        });

        it('still shows an "ask to join" message', async () => {
          await JoinGameScreen()
            .assert.submitButton.text('Ask to Join')
            .assert.remains();
        });

        describe('and they are playing', () => {
          beforeEach(async () => {
            await JoinGameScreen().socket([
              ['room:connect', 't35tt'],
              ['game:join', 'PLAYER 1', 'top-hat']
            ]);
          });

          it('should not enable their token with their name', async () => {
            await JoinGameScreen()
              .assert.tokenSelect.item('top-hat').disabled()
              .assert.tokenSelect.item('automobile').disabled()
              .assert.remains();
          });
        });

        describe('and selecting their token', () => {
          beforeEach(async () => {
            await JoinGameScreen()
              .tokenSelect.item('top-hat').click();
          });

          it('does not show an "ask to join" message', async () => {
            await JoinGameScreen()
              .assert.submitButton.not.text('Ask to Join')
              .assert.submitButton.text('Join Game');
          });
        });
      });

      describe('when asking to join', () => {
        let socket, pollId;

        beforeEach(async () => {
          socket = await JoinGameScreen().socket([
            ['room:connect', 't35tt'],
            ['game:join', 'PLAYER 1', 'top-hat']
          ]);

          await JoinGameScreen()
            .nameInput.type('Player 3')
            .tokenSelect.item('thimble').click()
            .submitButton.click();

          [pollId] = await socket.expect('poll:new');
        });

        it('should indicate the other players are being asked', async () => {
          await JoinGameScreen()
            .assert.submitButton.text('Asking...');
        });

        it('should disable inputs', async () => {
          await JoinGameScreen()
            .assert.nameInput.disabled()
            .assert.tokenSelect.disabled()
            .assert.submitButton.disabled();
        });

        describe('and the other player votes yes', () => {
          beforeEach(async () => {
            await socket.send('poll:vote', pollId, true);
          });

          it('should join the game', async () => {
            await JoinGameScreen()
              .assert.state('players.thimble')
              .assert.state('player.name', 'PLAYER 3')
              .assert.state('player.token', 'thimble');
          });

          it('should go to the game\'s home screen', async () => {
            await JoinGameScreen()
              .assert.location('/t35tt');
          });
        });

        describe('and the other player votes no', () => {
          beforeEach(async () => {
            await socket.send('poll:vote', pollId, false);
          });

          it('should leave inputs disabled', async () => {
            await JoinGameScreen()
              .assert.nameInput.disabled()
              .assert.tokenSelect.disabled()
              .assert.submitButton.disabled()
              .assert.remains();
          });

          it('should show an error', async () => {
            await JoinGameScreen()
              .assert.submitButton.text('Sorry, your friends hate you');
          });
        });
      });

      describe('when asking to join and nobody is connected', () => {
        beforeEach(async () => {
          await JoinGameScreen()
            .nameInput.type('Player 3')
            .tokenSelect.item('thimble').click()
            .submitButton.click();
        });

        it('should show an error', async () => {
          await JoinGameScreen()
            .assert.submitButton.text('Nobody is in the room');
        });
      });
    });
  });

  describe('with persisted player data', () => {
    beforeEach(async () => {
      JoinGameScreen().localstorage()
        .player = { name: 'PLAYER 1', token: 'top-hat' };
      await JoinGameScreen().visit();
    });

    it('should autofill the name and token', async () => {
      await JoinGameScreen()
        .assert.nameInput.value('PLAYER 1')
        .assert.tokenSelect.item('top-hat').selected()
        .assert.submitButton.not.disabled();
    });
  });

  describe('with a non-existent room', () => {
    beforeEach(async () => {
      await JoinGameScreen().visit('/f4k3e/join');
    });

    it('should redirect to no room', async () => {
      await JoinGameScreen().assert.location('/join');
    });
  });
});
