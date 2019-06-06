import expect from 'expect';

import {
  setupRoomForTesting,
  emitSocketEvent,
  promisifySocketEvent,
  connectToGameRoom,
  joinGameRoom,
  voteInNextPoll,
  createSocketAndConnect,
  createSocketAndJoinGame
} from './helpers';

import MonopolyError from '../../src/error';

describe('Room: joining', () => {
  let ws1;

  setupRoomForTesting({
    async beforeEach() {
      ws1 = await createSocketAndConnect(this.room);
    }
  });

  it('should let the first player join', async function() {
    let payload = await joinGameRoom(ws1, 'Player 1', 'top-hat');
    let { room, game, players, player } = payload;

    expect(room).toBe(this.room);
    expect(players).toContain('top-hat');
    expect(player).toEqual({ name: 'Player 1', token: 'top-hat' });
    expect(game).toHaveProperty('players.top-hat', {
      ...player,
      balance: 1500,
      history: [],
      bankrupt: false
    });
  });

  it('should let the player disconnect and rejoin', async function() {
    await joinGameRoom(ws1, 'Player 1', 'top-hat');
    emitSocketEvent(ws1, 'room:disconnect');
    await connectToGameRoom(ws1, this.room);

    await expect(joinGameRoom(ws1, 'Player 1', 'top-hat'))
      .resolves.toBeDefined();
  });

  it('should not let a player join more than once', async () => {
    await joinGameRoom(ws1, 'Player 1', 'top-hat');
    await expect(joinGameRoom(ws1, 'Player 2', 'automobile'))
      .rejects.toThrow(MonopolyError, /already joined/);
  });

  describe('with another player', () => {
    let ws2;

    beforeEach(async function() {
      await joinGameRoom(ws1, 'Player 1', 'top-hat');
      ws2 = await createSocketAndConnect(this.room);
    });

    it('should poll the first player to let the second join', async () => {
      let poll = promisifySocketEvent(ws1, 'poll:new');
      let join = promisifySocketEvent(ws2, 'game:joined');
      emitSocketEvent(ws2, 'game:join', 'Player 2', 'automobile');

      await expect(join).rejects.toThrow(MonopolyError, /sorry/i);
      await expect(poll).resolves.toHaveProperty('poll', {
        id: expect.any(String),
        message: expect.stringMatching(/Player 2 .* join/)
      });
    });

    it('should join after the first player votes yes', async () => {
      let vote = voteInNextPoll(ws1, true);
      await expect(joinGameRoom(ws2, 'Player 2', 'automobile')).resolves.toBeDefined();
      await expect(vote).resolves.toBeUndefined();
    });

    it('should not join after the first player votes no', async () => {
      let vote = voteInNextPoll(ws1, false);
      await expect(joinGameRoom(ws2, 'Player 2', 'automobile'))
        .rejects.toThrow(MonopolyError, /sorry/i);
      await expect(vote).resolves.toBeUndefined();
    });

    it('should tell players when the poll has ended', async () => {
      let ended = promisifySocketEvent(ws1, 'poll:end');
      voteInNextPoll(ws1, true);
      joinGameRoom(ws2, 'Player 2', 'automobile');
      await expect(ended).resolves.toBeDefined();
    });

    it('should not join after the poll times out', async () => {
      await expect(joinGameRoom(ws2, 'Player 2', 'automobile'))
        .rejects.toThrow(MonopolyError, /sorry/i);
    });

    it('should not attempt to join as an existing player', async () => {
      await expect(joinGameRoom(ws2, 'Player 1', 'top-hat'))
        .rejects.toThrow(MonopolyError, /already joined/);
    });

    it('should not attempt to join with the same token', async () => {
      await expect(joinGameRoom(ws2, 'Player 2', 'top-hat'))
        .rejects.toThrow(MonopolyError, /in use/);
    });
  });

  describe('with multiple players', () => {
    let ws2, ws3;

    beforeEach(async function() {
      await joinGameRoom(ws1, 'Player 1', 'top-hat');
      ws2 = await createSocketAndJoinGame(this.room, 'automobile');
      ws3 = await createSocketAndConnect(this.room);
    });

    it('should poll all players', async () => {
      let poll1 = promisifySocketEvent(ws1, 'poll:new');
      let poll2 = promisifySocketEvent(ws2, 'poll:new');
      let join = promisifySocketEvent(ws3, 'game:joined');
      emitSocketEvent(ws3, 'game:join', 'Player 3', 'thimble');

      let expected = {
        id: expect.any(String),
        message: expect.stringMatching(/Player 3 .* join/)
      };

      await expect(poll1).resolves.toHaveProperty('poll', expected);
      await expect(poll2).resolves.toHaveProperty('poll', expected);
      await expect(join).rejects.toThrow(MonopolyError, /sorry/i);
    });

    it('should join after majority votes yes', async () => {
      let vote1 = voteInNextPoll(ws1, true);
      let vote2 = voteInNextPoll(ws2, true);
      await expect(joinGameRoom(ws3, 'Player 3', 'thimble')).resolves.toBeDefined();
      await expect(vote1).resolves.toBeUndefined();
      await expect(vote2).resolves.toBeUndefined();
    });

    it('should not join after majority votes no', async () => {
      let vote1 = voteInNextPoll(ws1, true);
      let vote2 = voteInNextPoll(ws2, false);
      await expect(joinGameRoom(ws3, 'Player 3', 'thimble'))
        .rejects.toThrow(MonopolyError, /sorry/i);
      await expect(vote1).resolves.toBeUndefined();
      await expect(vote2).resolves.toBeUndefined();
    });
  });
});
