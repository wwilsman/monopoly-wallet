import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import {
  setupRoomForTesting,
  connectToGameRoom,
  joinGameRoom,
  createSocketAndConnect,
  createSocketAndJoinGame
} from '../room-helpers';

import MonopolyError from '../../../server/error';

describe('Room: joining', function() {
  let socket1;

  setupRoomForTesting({
    async beforeEach() {
      socket1 = await createSocketAndConnect(this.room);
    }
  });

  it('should let the first player join', async function() {
    await expect(joinGameRoom(socket1, 'Player 1', 'top-hat')).to.be.fulfilled
      .and.eventually.have.keys('id', 'state', 'config', 'players')
      .and.eventually.have.property('state')
      .that.has.property('players')
      .that.has.property('top-hat')
      .that.has.property('name')
      .that.equals('Player 1');
  });

  it('should let the player disconnect and rejoin', async function() {
    await joinGameRoom(socket1, 'Player 1', 'top-hat');

    socket1.disconnect();
    socket1.connect();

    await connectToGameRoom(socket1, this.room);
    await expect(joinGameRoom(socket1, 'Player 1', 'top-hat')).to.be.fulfilled;
  });

  it('should not let a player join more than once', async function() {
    await joinGameRoom(socket1, 'Player 1', 'top-hat');
    await expect(joinGameRoom(socket1, 'Player 2', 'automobile'))
      .to.be.rejectedWith(MonopolyError, /already joined/);
  });

  describe('with another player', function() {
    let socket2;

    beforeEach(async function() {
      await joinGameRoom(socket1, 'Player 1', 'top-hat');
      socket2 = await createSocketAndConnect(this.room);
    });

    it('should poll the first player to let the second join', function(done) {
      socket1.on('poll:new', (poll) => {
        expect(poll).to.have.keys('id', 'message');
        expect(poll.message).to.match(/join/);
        done();
      });

      socket2.emit('game:join', 'Player 2', 'automobile');
    });

    it('should join after the first player votes yes', async function() {
      socket1.on('poll:new', ({ id }) => socket1.emit('poll:vote', id, true));
      await expect(joinGameRoom(socket2, 'Player 2', 'automobile')).to.be.fulfilled;
    });

    it('should not join after the first player votes no', async function() {
      socket1.on('poll:new', ({ id }) => socket1.emit('poll:vote', id, false));

      await expect(joinGameRoom(socket2, 'Player 2', 'automobile'))
        .to.be.rejectedWith(MonopolyError, /sorry/i);
    });

    it('should not join after the poll times out', async function() {
      await expect(joinGameRoom(socket2, 'Player 2', 'automobile'))
        .to.be.rejectedWith(MonopolyError, /sorry/i);
    });

    it('should not attempt to join as an existing player', async function() {
      await expect(joinGameRoom(socket2, 'Player 1', 'top-hat'))
        .to.be.rejectedWith(MonopolyError, /already joined/);
    });

    it('should not attempt to join with the same token', async function() {
      await expect(joinGameRoom(socket2, 'Player 2', 'top-hat'))
        .to.be.rejectedWith(MonopolyError, /in use/);
    });
  });

  describe('with multiple players', function() {
    let socket2, socket3;

    beforeEach(async function() {
      await joinGameRoom(socket1, 'Player 1', 'top-hat');
      socket2 = await createSocketAndJoinGame(this.room, 'automobile');
      socket3 = await createSocketAndConnect(this.room);
    });

    it('should poll all players', function(done) {
      let count = 0;

      const handleNewPoll = (poll) => {
        expect(poll).to.have.keys('id', 'message');
        expect(poll.message).to.match(/Player 3 .* join/);
        if (++count === 2) done();
      };

      socket1.on('poll:new', handleNewPoll);
      socket2.on('poll:new', handleNewPoll);

      socket3.emit('game:join', 'Player 3', 'thimble');
    });

    it('should join after majority votes yes', async function() {
      socket1.on('poll:new', ({ id }) => socket1.emit('poll:vote', id, true));
      socket2.on('poll:new', ({ id }) => socket2.emit('poll:vote', id, true));
      await expect(joinGameRoom(socket3, 'Player 3', 'thimble')).to.be.fulfilled;
    });

    it('should not join after majority votes no', async function() {
      socket1.on('poll:new', ({ id }) => socket1.emit('poll:vote', id, true));
      socket2.on('poll:new', ({ id }) => socket2.emit('poll:vote', id, false));
      await expect(joinGameRoom(socket3, 'Player 3', 'thimble')).to.be.rejected;
    });
  });
});
