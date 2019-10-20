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

  bankrupt = scoped('[data-test-modal]', {
    heading: scoped('[data-test-modal-title]', {
      icon: attribute('[data-test-text-icon]', 'title')
    }),
    players: collection(token => (
      `[data-test-player-select] [data-test-radio-item${token ? `="${token}"` : ''}]`
    )),
    submitBtn: scoped('button[type="submit"]')
  });
}

export default BankInteractor;
