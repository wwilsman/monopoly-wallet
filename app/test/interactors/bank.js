import interactor, {
  attribute,
  collection,
  disabled,
  scoped
} from 'interactor.js';

import GameRoomInteractor, {
  ToastInteractor
} from './game-room';

@interactor class BankInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-bank]';
  static snapshotTitle = 'Bank';
  static defaultPath = '/t35tt/bank';

  backBtn = scoped('[data-test-back]');
  links = collection('[data-test-card]', {
    icon: attribute('[data-test-text-icon]', 'title')
  });

  gameHistory = scoped('[data-test-game-history]', {
    toasts: collection('[data-test-toast]', ToastInteractor)
  });

  bankrupt = scoped('[data-test-modal]', {
    heading: scoped('[data-test-modal-title]', {
      icon: attribute('[data-test-text-icon]', 'title')
    }),
    players: collection(token => (
      `[data-test-player-select] [data-test-radio-item${token ? `="${token}"` : ''}]`
    ), {
      disabled: disabled('input[type="radio"]')
    }),
    submitBtn: scoped('button[type="submit"]')
  });
}

export default BankInteractor;
