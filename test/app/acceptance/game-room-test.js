import { expect } from 'chai';
import { describe, beforeEach, it } from '../test-helpers';
import { describeApplication } from '../acceptance-helpers';

import GameRoomPage from '../pages/game-room';

describeApplication('GameRoomScreen', function() {
  describe('without joining', function() {
    beforeEach(function() {
      this.visit(`/${this.room.id}`);
    });

    it.still('should redirect to the join game screen', function() {
      expect(this.location.pathname).to.equal(`/${this.room.id}/join`);
    });
  });

  describe('after joining', function() {
    beforeEach(function() {
      this.emit('room:connect', this.room.id);
      this.emit('game:join', 'Player 1', 'top-hat');

      return this.visit(`/${this.room.id}`, () => {
        expect(GameRoomPage.$root).to.exist;
      });
    });

    // TODO
    it.skip('should show the room code', function() {
      expect(GameRoomPage.room).to.equal(this.room.id);
    });
  });
});
