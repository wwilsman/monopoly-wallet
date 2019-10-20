import interactor, { attribute, collection, scoped, text } from 'interactor.js';
import GameRoomInteractor, { ToastInteractor } from './game-room';

@interactor class BankInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-bank]';
  static snapshotTitle = 'Bank';
  static defaultPath = '/t35tt/bank';

  backBtn = scoped('[data-test-back]');
  links = collection('[data-test-card]', {
    icon: attribute('[data-test-text-icon]', 'title')
  });

  gameHistory = scoped('[data-test-history]', {
    heading: text('[data-test-history-heading]'),
    toasts: collection('[data-test-toast]', ToastInteractor)
  });
}

export default BankInteractor;
