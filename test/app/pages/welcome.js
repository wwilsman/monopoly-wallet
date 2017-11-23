import $ from 'jquery';
import { click } from './helpers';

export default {
  get $root() {
    return $('[data-test-welcome]');
  },

  get title() {
    return $('[data-test-welcome-title]').text();
  },

  get $newGameBtn() {
    return $('[data-test-welcome-new-game-btn]');
  },

  clickNewGame(assertion) {
    return click('[data-test-welcome-new-game-btn]', assertion);
  },

  get $joinGameBtn() {
    return $('[data-test-welcome-join-game-btn]');
  },

  clickJoinGame(assertion) {
    return click('[data-test-welcome-join-game-btn]', assertion);
  },

  goBack(assertion) {
    return click($('[data-test-back]'), assertion);
  }
};
