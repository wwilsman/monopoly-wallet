import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupRoomForTesting,
  createSocket,
  createGame,
  connectToGameRoom
} from '../room-helpers';

import MonopolyError from '../../../server/error';

describe('Room: connecting', function() {
  let ws;

  setupRoomForTesting({
    async beforeEach() {
      ws = await createSocket();
    }
  });

  it('should allow creating games', async function() {
    await expect(createGame(ws)).to.be.fulfilled
      .and.eventually.include.keys('id', 'state', 'config');
  });

  it('should allow connecting to games', async function() {
    await expect(connectToGameRoom(ws, this.room)).to.be.fulfilled
      .and.eventually.include.keys('id', 'state', 'config', 'players');
  });

  it('should emit an error when no game is found', async function() {
    await expect(connectToGameRoom(ws, 'F4K33'))
      .to.be.rejectedWith(MonopolyError, /not found/);
  });
});
