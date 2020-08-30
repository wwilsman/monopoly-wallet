import Interactor, {
  attribute,
  checked,
  disabled,
  text
} from 'interactor.js';

import GameRoomScreen from './game-room';

const TransferScreen = GameRoomScreen.extend({
  screen: 'transfer',
  path: '/t35tt/transfer'
}, {
  amount: text('[data-test-currency-input]'),
  input: Interactor('[data-test-currency-input] input'),
  deposit: Interactor('[data-test-toggle] input[type="checkbox"]'),

  recipient: Interactor('[data-test-player-select]', {
    label: text('[data-test-player-select-label]'),
    icon: attribute('[data-test-player-select-label] [data-test-text-icon]', 'title'),

    token: Interactor.extend({
      selector: token => token
        ? `[data-test-radio-item="${token}"]`
        : '[data-test-radio-item]'
    }, {
      selected: checked('input[type="radio"]'),
      disabled: disabled('input[type="radio"]'),
      name: text('[data-test-player-select-name]')
    })
  }),

  submitButton: Interactor('button[type="submit"]')
});

export default TransferScreen;
