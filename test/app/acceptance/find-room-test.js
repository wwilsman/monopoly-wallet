import { expect } from 'chai';
import { describe, beforeEach, it } from '../test-helpers';
import { describeApplication } from '../acceptance-helpers';

import FindRoomPage from '../pages/find-room';

describeApplication('FindRoomScreen', function() {
  beforeEach(function() {
    return this.visit('/join', () => {
      expect(FindRoomPage.$root).to.exist;
    });
  });

  it('should display a join game heading', function() {
    expect(FindRoomPage.heading).to.equal('Join Game');
  });

  it('should display a room code input', function() {
    expect(FindRoomPage.$roomInput).to.exist;
    expect(FindRoomPage.roomLabel).to.equal('room code');
  });


  it.still('should not show a back button', function() {
    expect(FindRoomPage.$backButton).to.not.exist;
  });

  describe('and searching for an existing room', function() {
    beforeEach(function() {
      return FindRoomPage.findGame(this.room.id);
    });

    it('should show a loading indicator', function() {
      expect(FindRoomPage.isLoading).to.be.true;
    });

    it('should disable all inputs', function() {
      expect(FindRoomPage.$roomInput).to.have.prop('disabled', true);
      expect(FindRoomPage.$submit).to.have.prop('disabled', true);
    });

    it('should go to the join game route for a game', function() {
      expect(this.location.pathname).to.equal(`/${this.room.id}/join`);
      expect(this.state.app.room).to.equal(this.room.id);
    });

    describe('then navigating back', function() {
      beforeEach(function() {
        return FindRoomPage.goBack(() => {
          expect(FindRoomPage.$root).to.exist;
        });
      });

      it('should go back', function() {
        expect(this.location.pathname).to.equal('/join');
      });

      it('should clear the game room', function() {
        expect(this.state.app.room).to.be.empty;
      });
    });
  });

  describe('and searching for a non-existent room', function() {
    beforeEach(function() {
      return FindRoomPage.findGame('f4k33');
    });

    it.still('should not change routes', function() {
      expect(this.location.pathname).to.equal('/join');
    });

    it('should show an error message', function() {
      expect(FindRoomPage.error).to.equal('Game not found');
    });
  });
});
