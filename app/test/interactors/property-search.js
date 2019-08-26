import interactor, {
  attribute,
  collection,
  count,
  exists,
  scoped,
  text
} from 'interactor.js';

import GameRoomInteractor from './game-room';

@interactor class PropertySearchInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-properties-search]';
  static snapshotTitle = 'Property Search';
  static defaultPath = '/t35tt/properties';

  backBtn = scoped('[data-test-back]');
  input = scoped('[data-test-input]');
  clearBtn = scoped('[data-test-property-search-clear]');

  property = scoped('[data-test-property]', {
    name: text('[data-test-property-name]'),
    group: attribute('[data-test-property-group]', 'data-test-property-group'),
    houses: count('[data-test-property-house]'),
    hotels: count('[data-test-property-hotel]'),
    mortgaged: exists('[data-test-property-mortgaged]'),
    rentLabels: collection('[data-test-property-content] dt'),
    rentAmounts: collection('[data-test-property-content] dd'),
    mortgage: text('[data-test-property-mortgage-value]'),
    cost: collection('[data-test-property-build-cost]'),
    buyBtn: scoped('[data-test-property-buy-btn]'),
    rentBtn: scoped('[data-test-property-rent-btn]')
  });
}

export default PropertySearchInteractor;
