import $ from 'jquery';
import { click, fill } from './helpers';

export default {
  get $root() {
    return $('[data-test-join-game]');
  },

  get isLoading() {
    return $('[data-test-spinner]').length > 0;
  },

  get heading() {
    return $('[data-test-join-game-heading]').text();
  },

  get room() {
    return $('[data-test-room-code]').text();
  },

  get $backBtn() {
    return $('[data-test-back]');
  },

  goBack(assertion) {
    return click('[data-test-back]', assertion);
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

  findGame(room, assertion) {
    return fill('[data-test-find-game-input] [data-test-input]', room)
      .then(() => click('[data-test-find-game-btn]', assertion));
  },

  get $nameInput() {
    return $('[data-test-join-game-name-input] [data-test-input]');
  },

  get nameLabel() {
    return $('[data-test-join-game-name-input] [data-test-label]').text();
  },

  fillName(value) {
    return fill('[data-test-join-game-name-input] [data-test-input]', value);
  },

  get tokensLabel() {
    return $('[data-test-join-game-token-select] [data-test-label]').text();
  },

  get $tokens() {
    return $('[data-test-join-game-token-select] [data-test-radio-item]');
  },

  get areTokensDisabled() {
    let $disabled = this.$tokens.find('input[type="radio"][disabled]');
    return this.$tokens.length === $disabled.length;
  },

  $token(name) {
    return $(`[data-test-radio-item="${name}"] input[type="radio"]`);
  },

  selectToken(name, assertion) {
    return click(`[data-test-radio-item="${name}"]`, assertion);
  },

  get $joinBtn() {
    return $('[data-test-join-game-btn]');
  },

  joinGame(name, token, assertion) {
    name && this.fillName(name);
    token && this.selectToken(token);
    return click('[data-test-join-game-btn]', assertion);
  }
};
