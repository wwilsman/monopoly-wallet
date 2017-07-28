import $ from 'jquery';
import { clickable } from './helpers';

const SELECTORS = {
  NEW_GAME_BUTTON: '[data-test-welcome-new-game-btn]',
  JOIN_GAME_BUTTON: '[data-test-welcome-join-game-btn]'
};

export default {
  get newGameButton() { return $(SELECTORS.NEW_GAME_BUTTON); },
  get joinGameButton() { return $(SELECTORS.JOIN_GAME_BUTTON); },
  clickNewGame: clickable(SELECTORS.NEW_GAME_BUTTON),
  clickJoinGame: clickable(SELECTORS.JOIN_GAME_BUTTON)
};
