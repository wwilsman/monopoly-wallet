import {
  page,
  find,
  text,
  clickable
} from '@bigtest/interaction';

@page class WelcomePage {
  title = text('[data-test-welcome-title]');
  $newGameBtn = find('[data-test-welcome-new-game-btn]');
  clickNewGame = clickable('[data-test-welcome-new-game-btn]');
  $joinGameBtn = find('[data-test-welcome-join-game-btn]');
  clickJoinGame = clickable('[data-test-welcome-join-game-btn]');
}

export default new WelcomePage('[data-test-welcome]');
