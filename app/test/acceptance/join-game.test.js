import expect from 'expect';
import { setupApplication, mockGame } from '../helpers';

import JoinGameInteractor from '../interactors/join-game';

describe('JoinGameScreen', () => {
  const joinGame = new JoinGameInteractor();

  setupApplication();

  describe('with a specific room', () => {
    beforeEach(async () => {
      await joinGame.visit();
    });

    it('should display the join game screen', async () => {
      await joinGame
        .assert.exists()
        .assert.not.loading()
        .percySnapshot();
    });

    it('should display a join game heading', async () => {
      await joinGame
        .assert.heading('JOIN GAME');
    });

    it('should display the room code', async () => {
      await joinGame
        .assert.roomId(joinGame.room.id.toUpperCase());
    });

    it('should display a name input field', async () => {
      await joinGame
        .assert.nameInput.exists()
        .assert.nameInput.label('Your Name');
    });

    it('should display a token select field', async () => {
      await joinGame
        .assert.tokens.label('Select A Token')
        .assert.tokens.count(count => {
          expect(count).toBe(joinGame.state.config.playerTokens.length);
        });
    });

    it('should not show a back button', async () => {
      await joinGame
        .assert.exists()
        .assert.backBtn.not.exists()
        .assert.remains();
    });

    describe('when only a name is provided', () => {
      beforeEach(async () => {
        await joinGame.nameInput.type('Player 1');
      });

      it('should not allow joining yet', async () => {
        await joinGame
          .assert.nameInput.value('PLAYER 1')
          .assert.submitBtn.disabled()
          .assert.remains();
      });
    });

    describe('when only a token is selected', () => {
      beforeEach(async () => {
        await joinGame.tokens.item('top-hat').click();
      });

      it('should not allow joining yet', async () => {
        await joinGame
          .assert.tokens.item('top-hat').selected()
          .assert.submitBtn.disabled()
          .assert.remains();
      });
    });

    describe('when both a name and token is selected', () => {
      beforeEach(async () => {
        await joinGame
          .nameInput.type('Player 1')
          .tokens.item('top-hat').click();
      });

      it('should allow joining', async () => {
        await joinGame
          .assert.submitBtn.text('Join Game')
          .assert.submitBtn.not.disabled()
          .percySnapshot('with name and token');
      });

      describe('and join game is clicked', () => {
        it('should disable all inputs', async () => {
          await joinGame
            .delaySocket(50)
            .submitBtn.click()
            .assert.nameInput.disabled()
            .assert.tokens.disabled()
            .assert.submitBtn.disabled()
            .assert.loading()
            .percySnapshot('loading');
        });

        it('should join the game', async () => {
          await joinGame
            .submitBtn.click()
            .assert.state(({ game, app }) => {
              expect(game.players).toHaveProperty('top-hat');
              expect(app.player).toEqual({ name: 'PLAYER 1', token: 'top-hat' });
            });
        });

        it('should go to the game\'s home screen', async () => {
          await joinGame
            .submitBtn.click()
            .assert.location(`/${joinGame.room.id}`);
        });
      });
    });

    describe('after joining a game', () => {
      beforeEach(async () => {
        await joinGame
          .nameInput.type('Player 1')
          .tokens.item('top-hat').click()
          .submitBtn.click();
      });

      it('should persist app data to local storage', async () => {
        await joinGame.assert(() => {
          let { room, player } = localStorage.data.app;
          expect(room).toBe(joinGame.room.id);
          expect(player).toEqual({ name: 'PLAYER 1', token: 'top-hat' });
        });
      });

      it('should persist player data to the location state', async () => {
        await joinGame
          .assert.state(({ router: { location: { state } } }) => {
            expect(state.player).toEqual({ name: 'PLAYER 1', token: 'top-hat' });
          });
      });

      describe('then navigating back', () => {
        beforeEach(async () => {
          await joinGame.goBack();
        });

        it('should disconnect the player', async () => {
          await joinGame
            .assert.state(({ app }) => {
              expect(app.player).toBeNull();
            });
        });

        it('should clear the persisted player from local storage', async () => {
          await joinGame.assert(() => {
            let { room, player } = localStorage.data.app;
            expect(room).toBe('');
            expect(player).toBeNull();
          });
        });
      });
    });

    describe('with other players', () => {
      beforeEach(async () => {
        await mockGame({ state: {
          players: [
            { token: 'top-hat' },
            { token: 'automobile' }
          ]
        }});
      });

      it('should prevent selecting used tokens', async () => {
        await joinGame
          .assert.tokens.item('top-hat').disabled()
          .assert.tokens.item('automobile').disabled()
          .percySnapshot('used tokens');
      });

      it('should show an "ask to join" message', async () => {
        await joinGame
          .assert.submitBtn.text('Ask to Join');
      });

      describe('when one of their names are filled in', () => {
        beforeEach(async () => {
          await joinGame.nameInput.type('Player 1');
        });

        it('should enable a used token with the token player\'s name', async () => {
          await joinGame
            .assert.tokens.item('top-hat').not.disabled()
            .assert.tokens.item('automobile').disabled();
        });

        describe('and they are playing', () => {
          beforeEach(async () => {
            await joinGame
              .room.constructor.connect(joinGame.room.id)
              .then(room => room.join('PLAYER 1', 'top-hat'));
          });

          it('should not enable their token with their name', async () => {
            await joinGame
              .assert.tokens.item('top-hat').disabled()
              .assert.tokens.item('automobile').disabled()
              .assert.remains();
          });
        });
      });

      describe('when asking to join', () => {
        let pollId;

        beforeEach(async () => {
          joinGame.room.on('poll:new', ({ id }) => pollId = id);

          await joinGame
            .room.constructor.connect(joinGame.room.id)
            .then(room => room.join('PLAYER 1', 'top-hat'));

          await joinGame
            .nameInput.type('Player 3')
            .tokens.item('thimble').click()
            .submitBtn.click();
        });

        it('should indicate the other players are being asked', async () => {
          await joinGame
            .assert.submitBtn.text('Asking...')
            .percySnapshot('asking to join');
        });

        it('should disable inputs', async () => {
          await joinGame
            .assert.nameInput.disabled()
            .assert.tokens.disabled()
            .assert.submitBtn.disabled();
        });

        describe('and the other player votes yes', () => {
          beforeEach(async () => {
            await joinGame.room.vote('top-hat', pollId, true);
          });

          it('should join the game', async () => {
            await joinGame
              .assert.state(({ app, game }) => {
                expect(game.players).toHaveProperty('thimble');
                expect(app.player).toEqual({ name: 'PLAYER 3', token: 'thimble' });
              });
          });

          it('should go to the game\'s home screen', async () => {
            await joinGame
              .assert.location(`/${joinGame.room.id}`);
          });
        });

        describe('and the other player votes no', () => {
          beforeEach(async () => {
            await joinGame.room.vote('top-hat', pollId, false);
          });

          it('should leave inputs disabled', async () => {
            await joinGame
              .assert.nameInput.disabled()
              .assert.tokens.disabled()
              .assert.submitBtn.disabled()
              .assert.remains();
          });

          it('should show an error', async () => {
            await joinGame
              .assert.submitBtn.text('Sorry, your friends hate you')
              .percySnapshot('not allowed to join');
          });
        });
      });
    });
  });

  describe('with a non-existent room', () => {
    beforeEach(async () => {
      await joinGame.visit('/f4k3e/join');
    });

    it('should redirect to no room', async () => {
      await joinGame.assert.location('/join');
    });
  });
});
