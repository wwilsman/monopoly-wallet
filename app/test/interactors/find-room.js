import Interactor from 'interactor.js';
import { Root, Input } from './common';

const FindRoomScreen = Root.extend({
  screen: 'find-room',
  path: '/join'
}, {
  roomInput: Input('[data-test-find-game-input]'),
  submitButton: Interactor('[data-test-find-game-btn]')
});

export default FindRoomScreen;
