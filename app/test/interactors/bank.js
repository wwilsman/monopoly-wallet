import interactor, {
  scoped
} from 'interactor.js';

import GameRoomInteractor from './game-room';

@interactor class BankInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-bank]';
  static snapshotTitle = 'Bank';
  static defaultPath = '/bank';

  backBtn = scoped('[data-test-back]');
}

export default BankInteractor;
