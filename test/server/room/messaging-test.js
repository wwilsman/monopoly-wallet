import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  setupRoomForTesting,
  createSocketAndJoinGame
} from '../room-helpers';

describe('Room: messaging', function() {
  let socket1, socket2;

  setupRoomForTesting({
    async beforeEach() {
      socket1 = await createSocketAndJoinGame(this.room, 'top-hat');
      socket2 = await createSocketAndJoinGame(this.room, 'automobile');
    }
  });

  it('should send and recieve messages', function(done) {
    socket2.on('message:recieved', (fromToken, message) => {
      expect(fromToken).to.equal('top-hat');
      expect(message).to.equal('hello world');
      done();
    });

    socket1.emit('message:send', 'automobile', 'hello world');
  });
});
