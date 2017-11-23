import $ from 'jquery';
import { click, fill } from './helpers';

export default {
  get $root() {
    return $('[data-test-find-room]');
  },

  get isLoading() {
    return $('[data-test-spinner]').length > 0;
  },

  get heading() {
    return $('[data-test-find-room-heading]').text();
  },

  get $backButton() {
    return $('[data-test-back]');
  },

  goBack(assertion) {
    return click('[data-test-back]', assertion);
  },

  get $roomInput() {
    return $('[data-test-find-game-input] [data-test-input]');
  },

  get roomLabel() {
    return $('[data-test-find-game-input] [data-test-label]').text();
  },

  get error() {
    return $('[data-test-find-game-input] [data-test-error]').text();
  },

  get $submit() {
    return $('[data-test-find-game-btn]');
  },

  findGame(room, assertion) {
    return fill('[data-test-find-game-input] [data-test-input]', room)
      .then(() => click('[data-test-find-game-btn]', assertion));
  }
};
