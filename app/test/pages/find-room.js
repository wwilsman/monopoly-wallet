import {
  page,
  find,
  text,
  clickable,
  isPresent
} from '@bigtest/interaction';

@page class FindRoomPage {
  isLoading = isPresent('[data-test-spinner]');
  heading = text('[data-test-find-room-heading]');
  hasBackBtn = isPresent('[data-test-back]');
  clickBack = clickable('[data-test-back]');
  $roomInput = find('[data-test-find-game-input] [data-test-input]');
  roomLabel = text('[data-test-find-game-input] [data-test-label]');
  error = text('[data-test-find-game-input] [data-test-error]');
  $submit = find('[data-test-find-game-btn]');

  findGame(room) {
    return this
      .fill('[data-test-find-game-input] [data-test-input]', room)
      .click('[data-test-find-game-btn]')
      .run();
  }
}

export default new FindRoomPage('[data-test-find-room]');
