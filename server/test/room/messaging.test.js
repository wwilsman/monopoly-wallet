import expect from 'expect';

import {
  setupRoomForTesting,
  emitSocketEvent,
  promisifySocketEvent,
  createSocketAndJoinGame
} from './helpers';

import MonopolyError from '../../src/error';

describe('Room: messaging', () => {
  let ws1, ws2;

  setupRoomForTesting({
    async beforeEach() {
      ws1 = await createSocketAndJoinGame(this.room, 'top-hat');
      ws2 = await createSocketAndJoinGame(this.room, 'automobile');
    }
  });

  it('should send and recieve messages', async () => {
    let message = promisifySocketEvent(ws2, 'message:received');
    emitSocketEvent(ws1, 'message:send', 'automobile', 'hello world');

    await expect(message).resolves.toHaveProperty('message', {
      from: 'top-hat',
      content: 'hello world'
    });
  });

  it('should error when the other player does not exist', async () => {
    let error = promisifySocketEvent(ws1); // simply throws on errors; never resolves
    emitSocketEvent(ws1, 'message:send', 'thimble', 'hello world');
    await expect(error).rejects.toThrow(MonopolyError, /cannot find player/i);
  });
});
