import Interactor, { attribute, by, click, text } from 'interactor.js';
import { Root } from './common';

const Toast = Interactor.extend({
  selector: n => by.nth(n, '[data-test-toast]')
}, {
  type: attribute('data-test-toast'),
  message: text('[data-test-toast-message]'),
  actions: Interactor('[data-test-actions]', {
    clickPrimary: () => click('[data-test-actions] button:first-child'),
    clickSecondary: () => click('[data-test-actions] button:last-child')
  }),
});

const GameRoomScreen = Root.extend({
  screen: 'game-room'
}, {
  toast: Toast(-1)
});

export default GameRoomScreen;
export { Toast };
