import interactor, {
  attribute,
  collection,
  computed,
  count,
  scoped,
  text
} from 'interactor.js';

import GameRoomInteractor from './game-room';

function rgb2hex(color) {
  let rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  let hex = x => ('0' + parseInt(x).toString(16).toUpperCase()).slice(-2);
  return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

@interactor class SummaryInteractor {
  name = text('[data-test-player-name]');
  token = attribute('[data-test-player-name] [data-test-text-icon]', 'title');
  balance = text('[data-test-player-balance]');
  groups = count('[data-test-property-list-group]');
  property = collection(id => id ? `[data-test-property="${id}"]` : '[data-test-property]', {
    group: attribute('[data-test-property-swatch]', 'data-test-property-swatch'),
    color: computed('[data-test-property-swatch]', $el => rgb2hex($el.style.backgroundColor))
  });
}

@interactor class DashboardInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-dashboard]';

  summary = scoped('[data-test-summary]', SummaryInteractor);
  card = collection('[data-test-player-card]', SummaryInteractor);
}

export default DashboardInteractor;
