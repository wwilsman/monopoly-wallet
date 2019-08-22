import interactor, { text, scoped } from 'interactor.js';
import GameRoomInteractor from './game-room';

@interactor class TransferInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-transfer]';
  static snapshotTitle = 'Transfer';
  static defaultPath = '/t35tt/transfer';

  backBtn = scoped('[data-test-back]');
  amount = text('[data-test-currency-input]');
  input = scoped('[data-test-currency-input] input');
  deposit = scoped('[data-test-toggle] input[type="checkbox"]');
  submit = scoped('button[type="submit"]');
}

export default TransferInteractor;
