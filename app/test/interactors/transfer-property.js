import Interactor, {
  check,
  checked,
  disabled,
  text
} from 'interactor.js';

import GameRoomScreen from './game-room';

const TransferPropertyScreen = GameRoomScreen.extend({
  screen: 'property-transfer'
}, {
  amount: text('[data-test-currency-value]'),
  input: Interactor('[data-test-currency-input] input'),

  recipient: Interactor.extend({
    selector: token => '[data-test-player-select] ' + token
      ? `[data-test-radio-item="${token}"]`
      : '[data-test-radio-item]'
  }, {
    select: () => check('input[type="radio"]'),
    selected: checked('input[type="radio"]'),
    disabled: disabled('input[type="radio"]'),
    name: text('[data-test-player-select-name]')
  }),

  property: text('[data-test-property-name]'),
  submitButton: Interactor('button[type="submit"]')
});

export default TransferPropertyScreen;
