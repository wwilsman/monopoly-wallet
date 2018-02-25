import {
  page,
  find,
  text,
  count,
  clickable,
  fillable,
  property,
  isPresent,
  collection
} from '@bigtest/interaction';

@page class JoinGamePage {
  isLoading = isPresent('[data-test-spinner]');
  heading = text('[data-test-join-game-heading]');
  room = text('[data-test-room-code]');
  hasBackBtn = isPresent('[data-test-back]');
  clickBack = clickable('[data-test-back]');
  $nameInput = find('[data-test-join-game-name-input] [data-test-input]');
  nameLabel = text('[data-test-join-game-name-input] [data-test-label]');
  fillName = fillable('[data-test-join-game-name-input] [data-test-input]');
  tokensLabel = text('[data-test-join-game-token-select] [data-test-label]');

  tokens = collection('[data-test-join-game-token-select] [data-test-radio-item]', {
    isDisabled: property('disabled', 'input[type="radio"]')
  });

  disabledTokens = count('[data-test-join-game-token-select] input[disabled]');
  $submit = find('[data-test-join-game-btn]');

  joinGame(name, token) {
    let join = this.interaction;
    if (name) join = join.fillName(name);
    if (token) join = join.click(`[data-test-radio-item="${token}"]`);
    return join.click('[data-test-join-game-btn]');
  }
}

export default new JoinGamePage('[data-test-join-game]');
