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

  visit(path = `/${this.room.id}`) {
    return super.visit(path);
  }

  roomId = text('[data-test-room-code]');
  loading = exists('[data-test-spinner]');

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
