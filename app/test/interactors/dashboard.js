import Interactor, { attribute, by, count, exists, text } from 'interactor.js';
import GameRoomScreen from './game-room';

function rgb2hex(color) {
  let rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  let hex = x => ('0' + parseInt(x).toString(16).toUpperCase()).slice(-2);
  return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

const PlayerSummary = Interactor.extend({
  linkTo: attribute('href'),
  name: text('[data-test-player-name]'),
  token: attribute('[data-test-player-name] [data-test-text-icon]', 'title'),
  balance: text('[data-test-player-balance]'),
  text: text('[data-test-properties-list]'),
  bankrupt: exists('[data-test-summary-bankrupt]'),
  groups: count('[data-test-properties-list-group]'),

  property: Interactor.extend({
    selector: id => id
      ? `[data-test-property="${id}"]`
      : '[data-test-property]'
  }, {
    group: attribute('[data-test-property-swatch]', 'data-test-property-swatch'),

    get color() {
      return rgb2hex(
        this.$('[data-test-property-swatch]')
          .style.backgroundColor
      );
    }
  })
});

const DashboardScreen = GameRoomScreen.extend({
  screen: 'dashboard',
  path: '/t35tt'
}, {
  bankButton: Interactor('[data-test-bank-btn]'),
  summary: PlayerSummary('[data-test-summary]'),

  card: PlayerSummary.extend({
    selector: n => by.nth(n, '[data-test-card]')
  }, {})
});

export default DashboardScreen;
