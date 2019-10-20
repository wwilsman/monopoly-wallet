import interactor, {
  attribute,
  collection,
  exists,
  scoped,
  text
} from 'interactor.js';

import AppInteractor from './app';

@interactor class ToastInteractor {
  static defaultScope = '[data-test-toast]';

  type = attribute('data-test-toast');
  message = text('[data-test-toast-message]');
  actions = scoped('[data-test-actions]', {
    primary: scoped('button:first-child'),
    secondary: scoped('button:last-child')
  });
}

export ToastInteractor;

@interactor class ToasterInteractor {
  static defaultScope = '[data-test-toaster]';

  get type() { return this.last.type; }
  get message() { return this.last.message; }
  get actions() { return this.last.actions; }

  last = scoped('[data-test-toast]:last-of-type', ToastInteractor);
  all = collection('[data-test-toast]', ToastInteractor);
}

@interactor class GameRoomInteractor extends AppInteractor {
  static defaultScope = '[data-test-game-room]';
  static snapshotTitle = 'Game Room';
  static defaultPath = '';

  roomCode = text('[data-test-room-code]');
  loading = exists('[data-test-spinner]');

  heading = scoped('[data-test-nav-title]', {
    icon: attribute('[data-test-text-icon]', 'title')
  });

  toast = new ToasterInteractor({
    detached: true
  });
}

export default GameRoomInteractor;
