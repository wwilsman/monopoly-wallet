import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupRoomForTesting,
  createSocket,
  connectToGameRoom,
  promisifySocketEvent,
} from '../room-helpers';

import MonopolyError from '../../../server/error';

const createGame = (socket) => {
  return promisifySocketEvent(socket, {
    emit: 'game:new',
    resolve: 'game:created',
    reject: 'room:error'
  })();
};

describe('Room: connecting', function() {
  setupRoomForTesting();

  it('should allow creating games', async function() {
    await expect(createGame(createSocket())).to.be.fulfilled
      .and.eventually.include.keys('id', 'state', 'config');
  });

  it('should allow connecting to games', async function() {
    await expect(connectToGameRoom(createSocket(), this.room)).to.be.fulfilled
      .and.eventually.include.keys('id', 'state', 'config', 'players');
  });

  it('should emit an error when no game is found', async function() {
    await expect(connectToGameRoom(createSocket(), 'F4K33'))
      .to.be.rejectedWith(MonopolyError, /not found/);
  });
});
