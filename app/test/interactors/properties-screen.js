import Interactor, {
  assertion,
  attribute,
  by,
  count,
  exists,
  text
} from 'interactor.js';

import { Input } from './common';
import GameRoomScreen from './game-room';

const PropertiesScreen = GameRoomScreen.extend({
  screen: 'properties-search',
  path: '/t35tt/properties'
}, {
  searchInput: Input('[data-test-property-search-input]'),
  clearSearch: Interactor('[data-test-property-search-clear]'),
  empty: Interactor('[data-test-property-empty]'),
  notFound: Interactor('[data-test-property-not-found]'),

  property: Interactor('[data-test-property]', {
    assert: {
      rent: assertion(function(n, ...expected) {
        let content = this.find('[data-test-property-content]');
        let label = content.find(by.nth(n, 'dt', 'of-type')).text;
        let amount = content.find(by.nth(n, 'dd', 'of-type')).text;

        return {
          message: `rent line ${n} is %{"${label}} for ${amount}`,
          result: label === expected[0] && amount === expected[1]
        };
      })
    },

    name: text('[data-test-property-name]'),
    group: attribute('[data-test-property-group]', 'data-test-property-group'),
    houses: count('[data-test-property-house]'),
    hotels: count('[data-test-property-hotel]'),
    get improved() { return !!(this.houses || this.hotels); },
    mortgaged: exists('[data-test-property-mortgaged]'),
    mortgage: text('[data-test-property-mortgage-value]'),
    cost: text('[data-test-property-build-cost]'),
    buyButton: Interactor('[data-test-property-buy-btn]'),
    otherButton: Interactor('[data-test-property-buy-other-btn]'),
    transferButton: Interactor('[data-test-property-transfer-btn]'),
    rentButton: Interactor('[data-test-property-rent-btn]'),
    mortgageButton: Interactor('[data-test-property-mortgage-btn]'),
    unmortgageButton: Interactor('[data-test-property-unmortgage-btn]'),
    improveButton: Interactor('[data-test-property-improve-btn]'),
    unimproveButton: Interactor('[data-test-property-unimprove-btn]')
  }),

  utilityForm: Interactor('[data-test-utility-rent-form]', {
    input: Interactor('[data-test-utility-rent-roll-amount] input'),
    value: text('[data-test-utility-rent-roll-amount] [data-test-value]'),
    rollButton: Interactor('[data-test-utility-rent-roll-btn]'),
    submitButton: Interactor('[type="submit"]')
  })
});

export default PropertiesScreen;
