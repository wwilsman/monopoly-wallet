import $ from 'jquery';
import { click } from './helpers';

export default {
  get $root() {
    return $('[data-test-game-room]');
  },

  get room() {
    return $('[data-test-room-code]').text();
  },

  get toasts() {
    return $('[data-test-toast]').map((i, t) => ({
      get type() {
        return $(t).data('test-toast');
      },

      get message() {
        return $('[data-test-toast-message]', t).text();
      },

      get $buttons() {
        return $('[data-test-actions] button', t);
      },

      click(i) {
        click(this.$buttons.eq(i));
      }
    }));
  }
};
