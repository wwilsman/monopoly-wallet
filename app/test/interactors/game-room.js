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
  static defaultPath = '';

  visit(path = this.constructor.defaultPath) {
    return super.visit(`/${this.room.id}${path}`);
  }

  roomId = text('[data-test-room-code]');
  loading = exists('[data-test-spinner]');

  heading = scoped('[data-test-player-name]', {
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
