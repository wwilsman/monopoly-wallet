import Interactor from 'interactor.js';
import { Root, Input, RadioGroup } from './common';

const JoinGameScreen = Root.extend({
  screen: 'join-game',
  path: '/t35tt/join'
}, {
  nameInput: Input('[data-test-join-game-name-input]'),
  tokenSelect: RadioGroup('[data-test-join-game-token-select]'),
  submitButton: Interactor('[data-test-join-game-btn]')
});

export default JoinGameScreen;
