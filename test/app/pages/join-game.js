import $ from 'jquery';
import { click, fill } from './helpers';

export default {
  get $root() {
    return $('[data-test-join-game]');
  },

  get heading() {
    return $('[data-test-join-game-heading]').text();
  },

  get $findGameModal() {
    return $('[data-test-find-game-modal]');
  },

  get $findGameInput() {
    return $('[data-test-find-game-input] [data-test-input]');
  },

  get findGameLabel() {
    return $('[data-test-find-game-input] [data-test-label]').text();
  },

  get findGameError() {
    return $('[data-test-find-game-input] [data-test-error]').text();
  },

  get $findGameBtn() {
    return $('[data-test-find-game-btn]');
  },

  findGame(room) {
    fill(this.$findGameInput, room);
    click(this.$findGameBtn);
  },

  get $nameInput() {
    return $('[data-test-join-game-name-input] [data-test-input]');
  },

  get nameLabel() {
    return $('[data-test-join-game-name-input] [data-test-label]').text();
  },

  fillName(value) {
    fill(this.$nameInput, value);
  },

  get tokensLabel() {
    return $('[data-test-join-game-token-select] [data-test-label]').text();
  },

  get $tokens() {
    return $('[data-test-join-game-token-select] [data-test-radio-item]');
  },

  selectToken(name) {
    click(this.$tokens.find(`[title=${name}]`));
  },

  get $joinBtn() {
    return $('[data-test-join-game-btn]');
  },

  joinGame(name, token) {
    name && this.fillName(name);
    token && this.selectToken(token);
    click(this.$joinBtn);
  }
};
