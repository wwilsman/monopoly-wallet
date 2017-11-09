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
      .and.eventually.have.property('game')
      .that.has.keys('id', 'theme', 'state', 'config');
  });

  it('should allow connecting to games', async function() {
    let connected = connectToGameRoom(ws, this.room);

    await expect(connected).to.be.fulfilled;
    await expect(connected).to.eventually.have.property('game')
      .that.has.keys('id', 'theme', 'state', 'config');
    await expect(connected).to.eventually.have.property('players');
  });

  it('should emit an error when no game is found', async function() {
    await expect(connectToGameRoom(ws, 'F4K33'))
      .to.be.rejectedWith(MonopolyError, /not found/);
  });
});
