import interactor, {
  check,
  checked,
  collection,
  disabled,
  text,
  scoped
} from 'interactor.js';

import GameRoomInteractor from './game-room';

@interactor class TransferPropertyInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-property-transfer]';
  static snapshotTitle = 'Transfer Property';

  backBtn = scoped('[data-test-back]');
  amount = text('[data-test-currency-value]');
  input = scoped('[data-test-currency-input] input');

  recipient = collection(token => (
    `[data-test-player-select] [data-test-radio-item="${token}"]`
  ), {
    select: check('input[type="radio"]'),
    selected: checked('input[type="radio"]'),
    disabled: disabled('input[type="radio"]'),
    name: text('[data-test-player-select-name]')
  });

  property = text('[data-test-property-name]');
  submit = scoped('button[type="submit"]');
}

export default TransferPropertyInteractor;
