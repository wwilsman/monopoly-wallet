import {
  beforeEach,
  afterEach
} from 'mocha';

import createGame from '../../server/game';
import FIXTURES from '../fixtures';

/**
 * Sets up testing within our game and preserves previously setup instances
 * @param {Object} [state] - Initial game state to merge with fixture
 * @param {Object} [config] - Game configuration to merge with fixture
 */
export function setupGame({ state = {}, config = {} } = {}) {
  const initialState = { ...FIXTURES.GAME, ...state };
  const gameConfig = { ...FIXTURES.CONFIG, ...config };
  let store, unsubscribe, old = {};

  beforeEach(function() {
    store = createGame(initialState, gameConfig);

    old.last = this.last;
    old.state = this.state;
    old.config = this.config;
    old.dispath = this.dispatch;

    this.state = store.getState();
    this.config = gameConfig;
    this.dispatch = store.dispatch;

    unsubscribe = store.subscribe(() => {
      this.last = this.state;
      this.state = store.getState();
    });
  });

  afterEach(function() {
    this.last = old.last;
    this.state = old.state;
    this.config = old.config;
    this.dispatch = old.dispatch;

    unsubscribe();
    store = null;
  });
}
