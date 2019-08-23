import interactor, {
  attribute,
  count,
  collection,
  checked,
  text,
  scoped
} from 'interactor.js';

import GameRoomInteractor from './game-room';

@interactor class TransferInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-transfer]';
  static snapshotTitle = 'Transfer';
  static defaultPath = '/t35tt/transfer';

  backBtn = scoped('[data-test-back]');
  amount = text('[data-test-currency-input]');
  input = scoped('[data-test-currency-input] input');
  deposit = scoped('[data-test-toggle] input[type="checkbox"]');

  recipient = scoped('[data-test-player-select]', {
    label: text('[data-test-player-select-label]'),
    icon: attribute('[data-test-player-select-label] [data-test-text-icon]', 'title'),
    count: count('[data-test-radio-item]'),

    token: collection(token => `[data-test-radio-item="${token}"]`, {
      selected: checked('input[type="radio"]'),
      name: text('[data-test-player-select-name]')
    })
  });

  submit = scoped('button[type="submit"]');
}

export default TransferInteractor;
