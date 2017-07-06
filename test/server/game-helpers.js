import YAML from 'yamljs';
import {
  before,
  beforeEach,
  afterEach
} from 'mocha';

import {
  getPlayer,
  getProperty,
  getProperties,
  createGameState,
  transformGameState
} from '../helpers';
import createGame from '../../server/game';

// fixtures
const CONFIG_FIXTURE = YAML.load('./server/themes/classic/config.yml');
const PROPERTY_FIXTURES = YAML.load('./server/themes/classic/properties.yml');
const MESSAGES_FIXTURE = YAML.load('./server/themes/classic/messages.yml');

/**
 * Sets up testing context for a new game store instance each test
 * @param {Object} [state={}] - Game state transforms
 * @param {Object} [config={}] - Custom game configuration
 */
export function setupGameForTesting({ state = {}, config = {} } = {}) {
  before(function() {
    this.config = { ...CONFIG_FIXTURE, ...config };
    this.initial = createGameState(PROPERTY_FIXTURES, this.config);
    this.initial = transformGameState(this.initial, state, this.config);
  });

  setupGameStore();
}

/**
 * Modifies the current game state and a new store is instantiated
 * @param {Object} [state={}] - Game state transforms
 * @param {Object} [config={}] - Custom game configuration
 */
export function modifyGameInTesting({ state = {}, config = {} } = {}) {
  before(function() {
    this.config = { ...this.config, ...config };
    this.initial = transformGameState(this.initial, state, this.config);
  });

  setupGameStore();
}

/**
 * Sets up the game store instance for testing and preserves/restores
 * any previous instances.
 */
function setupGameStore() {
  let store, unsubscribe;

  beforeEach(function() {
    store = createGame(
      this.initial,
      this.config,
      MESSAGES_FIXTURE
    );

    this.state = store.getState();
    this.dispatch = store.dispatch;

    unsubscribe = store.subscribe(() => {
      this.last = this.state;
      this.state = store.getState();
    });

    this.getPlayer = (id) => getPlayer(this.state, id);
    this.getProperty = (id) => getProperty(this.state, id);
    this.getProperties = (group) => getProperties(this.state, group);
  });

  afterEach(function() {
    unsubscribe();
    unsubscribe = null;
    store = null;
  });
}
