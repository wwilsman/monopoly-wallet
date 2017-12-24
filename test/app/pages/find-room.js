import $ from 'jquery';
import { Interaction, click } from './helpers';

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

  findGame(room) {
    return new Interaction()
      .fill('[data-test-find-game-input] [data-test-input]', room)
      .click('[data-test-find-game-btn]')
      .run();
  }
};
