import interactor, { scoped, text } from 'interactor.js';
import AppInteractor from './app';

@interactor
class WelcomeInteractor extends AppInteractor {
  static defaultScope = '[data-test-welcome]';

  title = text('[data-test-welcome-title]');
  newGameBtn = scoped('[data-test-welcome-new-game-btn]');
  joinGameBtn = scoped('[data-test-welcome-join-game-btn]');
}

export default WelcomeInteractor;
