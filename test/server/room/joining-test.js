import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import {
  setupRoomForTesting,
  emitSocketEvent,
  promisifySocketEvent,
  connectToGameRoom,
  joinGameRoom,
  voteInNextPoll,
  createSocketAndConnect,
  createSocketAndJoinGame
} from '../room-helpers';

import MonopolyError from '../../../server/error';

describe('Room: joining', function() {
  let ws1;

  setupRoomForTesting({
    async beforeEach() {
      ws1 = await createSocketAndConnect(this.room);
    }
  });

  it('should let the first player join', async function() {
    let payload = await joinGameRoom(ws1, 'Player 1', 'top-hat');
    let { room, game, players, player } = payload;

    expect(room).to.equal(this.room);
    expect(players).to.include('top-hat');
    expect(player).to.deep.equal({ name: 'Player 1', token: 'top-hat' });
    expect(game).to.have.nested.property('players.top-hat')
      .that.deep.equals({
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
    await expect(joinGameRoom(ws1, 'Player 1', 'top-hat')).to.be.fulfilled;
  });

  it('should not let a player join more than once', async function() {
    await joinGameRoom(ws1, 'Player 1', 'top-hat');
    await expect(joinGameRoom(ws1, 'Player 2', 'automobile'))
      .to.be.rejectedWith(MonopolyError, /already joined/);
  });

  describe('with another player', function() {
    let ws2;

    beforeEach(async function() {
      await joinGameRoom(ws1, 'Player 1', 'top-hat');
      ws2 = await createSocketAndConnect(this.room);
    });

    it('should poll the first player to let the second join', async function() {
      let poll = promisifySocketEvent(ws1, 'poll:new');
      let join = promisifySocketEvent(ws2, 'game:joined');
      emitSocketEvent(ws2, 'game:join', 'Player 2', 'automobile');

      await expect(poll).to.be.fulfilled;
      await expect(poll).to.eventually.have.property('poll')
        .that.has.keys('id', 'message')
        .and.property('message').matches(/Player 2 .* join/);
      await expect(join).to.be.rejected;
    });

    it('should join after the first player votes yes', async function() {
      let vote = voteInNextPoll(ws1, true);
      await expect(joinGameRoom(ws2, 'Player 2', 'automobile')).to.be.fulfilled;
      await expect(vote).to.be.fulfilled;
    });

    it('should not join after the first player votes no', async function() {
      let vote = voteInNextPoll(ws1, false);
      await expect(joinGameRoom(ws2, 'Player 2', 'automobile'))
        .to.be.rejectedWith(MonopolyError, /sorry/i);
      await expect(vote).to.be.fulfilled;
    });

    it('should tell players when the poll has ended', async function() {
      let ended = promisifySocketEvent(ws1, 'poll:end');
      voteInNextPoll(ws1, true);
      joinGameRoom(ws2, 'Player 2', 'automobile');
      await expect(ended).to.be.fulfilled;
    });

    it('should not join after the poll times out', async function() {
      await expect(joinGameRoom(ws2, 'Player 2', 'automobile'))
        .to.be.rejectedWith(MonopolyError, /sorry/i);
    });

    it('should not attempt to join as an existing player', async function() {
      await expect(joinGameRoom(ws2, 'Player 1', 'top-hat'))
        .to.be.rejectedWith(MonopolyError, /already joined/);
    });

    it('should not attempt to join with the same token', async function() {
      await expect(joinGameRoom(ws2, 'Player 2', 'top-hat'))
        .to.be.rejectedWith(MonopolyError, /in use/);
    });
  });

  describe('with multiple players', function() {
    let ws2, ws3;

    beforeEach(async function() {
      await joinGameRoom(ws1, 'Player 1', 'top-hat');
      ws2 = await createSocketAndJoinGame(this.room, 'automobile');
      ws3 = await createSocketAndConnect(this.room);
    });

    it('should poll all players', async function() {
      let poll1 = promisifySocketEvent(ws1, 'poll:new');
      let poll2 = promisifySocketEvent(ws2, 'poll:new');
      let join = promisifySocketEvent(ws3, 'game:joined');
      emitSocketEvent(ws3, 'game:join', 'Player 3', 'thimble');

      await expect(poll1).to.be.fulfilled;
      await expect(poll1).to.eventually.have.property('poll')
        .that.has.keys('id', 'message')
        .and.property('message').matches(/Player 3 .* join/);
      await expect(poll2).to.be.fulfilled;
      await expect(poll2).to.eventually.have.property('poll')
        .that.has.keys('id', 'message')
        .and.property('message').matches(/Player 3 .* join/);
      await expect(join).to.be.rejected;
    });

    it('should join after majority votes yes', async function() {
      let vote1 = voteInNextPoll(ws1, true);
      let vote2 = voteInNextPoll(ws2, true);
      await expect(joinGameRoom(ws3, 'Player 3', 'thimble')).to.be.fulfilled;
      await expect(vote1).to.be.fulfilled;
      await expect(vote2).to.be.fulfilled;
    });

    it('should not join after majority votes no', async function() {
      let vote1 = voteInNextPoll(ws1, true);
      let vote2 = voteInNextPoll(ws2, false);
      await expect(joinGameRoom(ws3, 'Player 3', 'thimble')).to.be.rejected;
      await expect(vote1).to.be.fulfilled;
      await expect(vote2).to.be.fulfilled;
    });
  });
});
