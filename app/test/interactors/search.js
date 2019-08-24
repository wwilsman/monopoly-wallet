import interactor, { attribute, collection, scoped, text } from 'interactor.js';

import GameRoomInteractor from './game-room';

@interactor class SearchInteractor extends GameRoomInteractor {
  static defaultScope = '[data-test-properties-search]';
  static snapshotTitle = 'Property Search';
  static defaultPath = '/t35tt/properties';

  backBtn = scoped('[data-test-back]');
  input = scoped('[data-test-input]');
  clearBtn = scoped('[data-test-property-search-clear]');

  property = scoped('[data-test-property]', {
    price: text('[data-test-property-price]'),
    name: text('[data-test-property-name]'),
    group: attribute('[data-test-property-group]', 'data-test-property-group'),
    rentLabels: collection('[data-test-property-content] dt'),
    rent: collection('[data-test-property-content] dd'),
    mortgage: text('[data-test-property-mortgage-value]'),
    cost: collection('[data-test-property-build-cost]')
  });
}

export default SearchInteractor;
