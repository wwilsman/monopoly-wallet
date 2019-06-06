import expect from 'expect';

import {
  setupRoomForTesting,
  createSocket,
  createGame,
  connectToGameRoom
} from './helpers';

import MonopolyError from '../../src/error';

describe('Room: connecting', () => {
  let ws;

  setupRoomForTesting({
    async beforeEach() {
      ws = await createSocket();
    }
  });

  it('should allow creating games', async () => {
    await expect(createGame(ws))
      .resolves.toEqual({
        room: expect.any(String),
        theme: expect.any(String),
        game: expect.any(Object),
        config: expect.any(Object)
      });
  });

  it('should allow connecting to games', async function() {
    await expect(connectToGameRoom(ws, this.room))
      .resolves.toEqual({
        room: expect.any(String),
        theme: expect.any(String),
        game: expect.any(Object),
        config: expect.any(Object),
        players: expect.any(Array)
      });
  });

  it('should not care when connecting more than once', async function() {
    await expect(connectToGameRoom(ws, this.room)).resolves.toBeDefined();
    await expect(connectToGameRoom(ws, this.room)).resolves.toBeDefined();
  });

  it('should emit an error when no game is found', async () => {
    await expect(connectToGameRoom(ws, 'F4K33'))
      .rejects.toThrow(MonopolyError, /not found/);
  });
});
