import {
  page,
  text,
  attribute,
  clickable,
  isPresent,
  collection
} from '@bigtest/interaction';

@page class GameRoomPage {
  room = text('[data-test-room-code]');
  isLoading = isPresent('[data-test-spinner]');

  toast = collection('[data-test-toast]', {
    type: attribute('data-test-toast'),
    message: text('[data-test-toast-message]'),
    hasActions: isPresent('[data-test-actions]'),
    clickPrimary: clickable('[data-test-actions] button:first-child'),
    clickSecondary: clickable('[data-test-actions] button:last-child')
  });
}

export default new GameRoomPage('[data-test-game-room]');
