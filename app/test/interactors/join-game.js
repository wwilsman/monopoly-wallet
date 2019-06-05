import interactor, {
  checked,
  collection,
  count,
  disabled,
  exists,
  scoped,
  text,
  type,
  value
} from 'interactor.js';

import AppInteractor from './app';

@interactor class JoinGameInteractor extends AppInteractor {
  static defaultScope = '[data-test-join-game]';

  visit(path = `/${this.room.id}/join`) {
    return super.visit(path);
  }

  loading = exists('[data-test-spinner]');
  heading = text('[data-test-join-game-heading]');
  roomId = text('[data-test-room-code]');
  backBtn = scoped('[data-test-back]');

  nameInput = scoped('[data-test-join-game-name-input]', {
    disabled: disabled('[data-test-input]'),
    label: text('[data-test-label]'),
    type: str => type('[data-test-input]', str),
    value: value('[data-test-input]')
  })

  tokens = scoped('[data-test-join-game-token-select]', {
    label: text('[data-test-label]'),
    count: count('[data-test-radio-item]'),

    get disabled() {
      return this.item().every(item => item.disabled);
    },

    item: collection((token) => `[data-test-radio-item="${token}"]`, {
      disabled: disabled('input[type="radio"]'),
      selected: checked('input[type="radio"]')
    })
  });

  submitBtn = scoped('[data-test-join-game-btn]');
}

export default JoinGameInteractor;
