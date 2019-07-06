import interactor, {
  collection,
  text,
  type,
  scoped
} from 'interactor.js';

import GameRoomInteractor from './game-room';

@interactor class BankInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-bank]';
  static snapshotTitle = 'Bank';
  static defaultPath = '/bank';

  backBtn = scoped('[data-test-back]');
  headings = collection('[data-test-bank-heading]');
  transfer = scoped('[data-test-bank-transfer-form]', {
    amount: text('[data-test-currency-input]'),
    type: str => type('[data-test-currency-input] input', str),
    deposit: scoped('[data-test-toggle] input[type="checkbox"]'),
    submit: scoped('button[type="submit"]')
  });
}

export default BankInteractor;
