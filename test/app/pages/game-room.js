import $ from 'jquery';

export default {
  get $root() {
    return $('[data-test-game-room]');
  },

  get room() {
    return $('[data-test-room-code]').text();
  }
};
