import Interactor, { attribute, by } from 'interactor.js';
import { RadioGroup } from './common';
import GameRoom, { Toast } from './game-room';

const BankScreen = GameRoom.extend({
  screen: 'bank',
  path: '/t35tt/bank'
}, {
  link: Interactor.extend({
    selector: n => by.nth(n, '[data-test-card]')
  }, {
    icon: attribute('[data-test-text-icon]', 'title')
  }),

  gameHistory: Interactor('[data-test-game-history]', {
    item: Toast
  }),

  bankrupt: Interactor('[data-test-modal]', {
    players: RadioGroup('[data-test-player-select]'),
    submitButton: Interactor('button[type="submit"]')
  })
});

export default BankScreen;
