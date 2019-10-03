import interactor, { text, scoped } from 'interactor.js';
import GameRoomInteractor from './game-room';

@interactor class TransferPropertyInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-transfer]';
  static snapshotTitle = 'Transfer Property';

  backBtn = scoped('[data-test-back]');
  amount = text('[data-test-currency-value]');
  input = scoped('[data-test-currency-input] input');
  property = text('[data-test-property-name]');
  submit = scoped('button[type="submit"]');
}

export default TransferPropertyInteractor;
