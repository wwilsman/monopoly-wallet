import $ from 'jquery';
import { click } from './helpers';

export default {
  get $root() {
    return $('[data-test-game-room]');
  },

  get room() {
    return $('[data-test-room-code]').text();
  },

  get isLoading() {
    return $('[data-test-spinner]').length > 0;
  },

  toast(index) {
    let selector = `[data-test-toast]:eq(${index})`;

    return {
      get type() {
        return $(selector).data('test-toast');
      },

      get message() {
        return $(`${selector} [data-test-toast-message]`).text();
      },

      get $actions() {
        return $(`${selector} [data-test-actions]`);
      },

      click(i, assertion) {
        let btn = `${selector} [data-test-actions] button:eq(${i})`;
        return click(btn, assertion);
      }
    };
  }
};
