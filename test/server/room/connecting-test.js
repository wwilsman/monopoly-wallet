import { describe, beforeEach, afterEach, it } from 'mocha';
import { expect } from 'chai';

import io from 'socket.io-client';
import '../../../server';

describe('Room: connecting', function() {

  beforeEach(function() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      forceNew: true
    });
  });

  afterEach(function() {
    this.socket.disconnect();
  });

  it('should allow creating games', function(done) {
    this.socket.on('game:created', (game) => {
      expect(game).to.have.keys('id', 'state', 'config');
      done();
    });

    this.socket.emit('game:new');
  });

  it('should allow connecting to games', function(done) {
    this.socket.on('room:connected', (game) => {
      expect(game).to.have.keys('id', 'state', 'config');
      done();
    });

    this.socket.on('game:created', (game) => {
      this.socket.emit('room:connect', game.id);
    });

    this.socket.emit('game:new');
  });

  it('should emit an error when no game is found', function(done) {
    this.socket.on('room:error', (message) => {
      expect(message).to.match(/not found/);
      done();
    });

    this.socket.on('game:created', () => {
      this.socket.emit('room:connect', 'F4K33');
    });

    this.socket.emit('game:new');
  });
});
