import expect from 'expect';
import { setupApplication } from '../helpers';

import JoinGameInteractor from '../interactors/join-game';
import GameRoomInteractor from '../interactors/game-room';

describe('JoinGameScreen', () => {
  const joinGame = new JoinGameInteractor();

  setupApplication(async function () {
    await this.grm.mock({ room: 't35tt' });
  });

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
        .assert.roomCode('T35TT');
    });

    it('should display a name input field', async () => {
      await joinGame
        .assert.nameInput.exists()
        .assert.nameInput.label('Your Name');
    });

    it('should display a token select field', async () => {
      let { playerTokens } = await joinGame.get('state.config');

      await joinGame
        .assert.tokens.label('Select A Token')
        .assert.tokens.count(playerTokens.length);
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
        it('should disable all inputs', async function () {
          this.grm.wss.timing(50);

          await joinGame
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
            .assert.state(state => {
              expect(state).toHaveProperty('player', { name: 'PLAYER 1', token: 'top-hat' });
              expect(state).toHaveProperty('players.top-hat', (
                expect.objectContaining({ name: 'PLAYER 1' })
              ));
            });
        });

        it('should go to the game\'s home screen', async () => {
          await joinGame
            .submitBtn.click()
            .assert.location('/t35tt');
        });
      });
    });

    describe('after joining a game', () => {
      let gameRoom = new GameRoomInteractor();

      beforeEach(async () => {
        await joinGame
          .nameInput.type('Player 1')
          .tokens.item('top-hat').click()
          .submitBtn.click();
      });

      it('should go to the game room screen', async () => {
        await gameRoom
          .assert.exists()
          .assert.roomCode('T35TT')
          .assert.heading.text('PLAYER 1');
      });

      it('should persist app data to local storage', async function () {
        await gameRoom.assert(() => {
          expect(this.ls.data).toHaveProperty('room', 't35tt');
          expect(this.ls.data).toHaveProperty('player', { name: 'PLAYER 1', token: 'top-hat' });
        });
      });

      it('should persist player data to the location state', async () => {
        await gameRoom.assert.history(({ location: { state } }) => {
          expect(state).toHaveProperty('player', { name: 'PLAYER 1', token: 'top-hat' });
        });
      });

      describe('then navigating back', () => {
        beforeEach(async () => {
          await gameRoom
            .assert.exists()
            .assert.location('/t35tt')
            .goBack();
        });

        it('should go back to the join game screen', async () => {
          await joinGame
            .assert.location('/t35tt/join');
        });

        it('should disconnect the player, but remain connected to the game', async () => {
          await joinGame.assert.state(state => {
            expect(state).toHaveProperty('room', 't35tt');
            expect(state).not.toHaveProperty('player');
          });
        });

        it('should clear the persisted player from local storage', async function () {
          await joinGame.assert(() => {
            expect(this.ls.data).toHaveProperty('room', '');
            expect(this.ls.data).toHaveProperty('player', null);
          });
        });
      });
    });

    describe('with other players', () => {
      beforeEach(async function () {
        await this.grm.mock({
          room: 't35tt',
          players: [
            { token: 'top-hat' },
            { token: 'automobile' }
          ]
        });
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
          beforeEach(async function () {
            await this.socket([
              ['room:connect', 't35tt'],
              ['game:join', 'PLAYER 1', 'top-hat']
            ]);
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
        let socket, pollId;

        beforeEach(async function () {
          socket = await this.socket([
            ['room:connect', 't35tt'],
            ['game:join', 'PLAYER 1', 'top-hat']
          ]);

          await joinGame
            .nameInput.type('Player 3')
            .tokens.item('thimble').click()
            .submitBtn.click();

          [pollId] = await socket.expect('poll:new');
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
            await socket.send('poll:vote', pollId, true);
          });

          it('should join the game', async () => {
            await joinGame.assert.state(state => {
              expect(state).toHaveProperty('players.thimble');
              expect(state).toHaveProperty('player', { name: 'PLAYER 3', token: 'thimble' });
            });
          });

          it('should go to the game\'s home screen', async () => {
            await joinGame
              .assert.location('/t35tt');
          });
        });

        describe('and the other player votes no', () => {
          beforeEach(async () => {
            await socket.send('poll:vote', pollId, false);
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
