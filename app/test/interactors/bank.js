import interactor, { attribute, collection, scoped } from 'interactor.js';
import GameRoomInteractor from './game-room';

@interactor class BankInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-bank]';
  static snapshotTitle = 'Bank';
  static defaultPath = '/t35tt/bank';

  backBtn = scoped('[data-test-back]');
  links = collection('[data-test-card]', {
    icon: attribute('[data-test-text-icon]', 'title')
  });
}

export default BankInteractor;
