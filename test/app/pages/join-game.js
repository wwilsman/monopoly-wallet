import $ from 'jquery';
import { click, clickable, fill } from './helpers';

const SELECTORS = {
  FIND_GAME_MODAL: '[data-test-find-game-modal]',
  FIND_GAME_LABEL: '[data-test-find-game-input] [data-test-label]',
  FIND_GAME_INPUT: '[data-test-find-game-input] [data-test-input]',
  FIND_GAME_ERROR: '[data-test-find-game-input] [data-test-error]',
  FIND_GAME_BUTTON: '[data-test-find-game-btn]',
  JOIN_NAME_LABEL: '[data-test-join-name-input] [data-test-label]',
  JOIN_NAME_INPUT: '[data-test-join-name-input] [data-test-input]',
  JOIN_BUTTON: '[data-test-join-button]'
};

export default {
  get nameLabel() { return $(SELECTORS.JOIN_NAME_LABEL); },
  get nameInput() { return $(SELECTORS.JOIN_NAME_INPUT); },
  get findGameModal() { return $(SELECTORS.FIND_GAME_MODAL); },
  get findGameLabel() { return $(SELECTORS.FIND_GAME_LABEL); },
  get findGameInput() { return $(SELECTORS.FIND_GAME_INPUT); },
  get findGameError() { return $(SELECTORS.FIND_GAME_ERROR); },

  async findGame(room) {
    fill(SELECTORS.FIND_GAME_INPUT, room);
    click(SELECTORS.FIND_GAME_BUTTON);
  }
};
