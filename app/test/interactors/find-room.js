import interactor, {
  disabled,
  exists,
  scoped,
  text,
  type
} from 'interactor.js';

import AppInteractor from './app';

@interactor class FindRoomInteractor extends AppInteractor {
  static defaultScope = '[data-test-find-room]';
  static defaultPath = '/join';
  static snapshotTitle = 'Find Room';

  loading = exists('[data-test-spinner]');
  heading = text('[data-test-find-room-heading]');
  backBtn = scoped('[data-test-back]');

  roomInput = scoped('[data-test-find-game-input]', {
    type: str => type('[data-test-input]', str),
    disabled: disabled('[data-test-input]'),
    label: text('[data-test-label]'),
    error: text('[data-test-error]')
  });

  submitBtn = scoped('[data-test-find-game-btn]');
}

export default FindRoomInteractor;
