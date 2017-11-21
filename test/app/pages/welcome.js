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
  clickNewGame() {
    click(this.$newGameBtn);
  },

  get $joinGameBtn() {
    return $('[data-test-welcome-join-game-btn]');
  },
  clickJoinGame() {
    click(this.$joinGameBtn);
  },

  goBack() {
    click($('[data-test-back]'));
  }
};
