import interactor, {
  attribute,
  collection,
  exists,
  scoped,
  text
} from 'interactor.js';

import AppInteractor from './app';

@interactor class GameRoomInteractor extends AppInteractor {
  static defaultScope = '[data-test-game-room]';
  static snapshotTitle = 'Game Room';
  static defaultPath = '';

  roomCode = text('[data-test-room-code]');
  loading = exists('[data-test-spinner]');

  heading = scoped('[data-test-screen-title]', {
    icon: attribute('[data-test-text-icon]', 'title')
  });

  toast = collection('[data-test-toast]', {
    type: attribute('data-test-toast'),
    message: text('[data-test-toast-message]'),
    actions: scoped('[data-test-actions]', {
      primary: scoped('button:first-child'),
      secondary: scoped('button:last-child')
    })
  });
}

export default GameRoomInteractor;
