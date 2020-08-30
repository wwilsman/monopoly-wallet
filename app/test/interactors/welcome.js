import { click } from 'interactor.js';
import { Root } from './common';

const WelcomeScreen = Root.extend({
  screen: 'welcome',
}, {
  clickNewGame: () => click('[data-test-welcome-new-game-btn]'),
  clickJoinGame: () => click('[data-test-welcome-join-game-btn]')
});

export default WelcomeScreen;
