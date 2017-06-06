import slug from 'slug';
import {
  beforeEach,
  afterEach
} from 'mocha';

import createGame from '../../server/game';
import { getPlayer } from '../../server/helpers';
import FIXTURES from '../fixtures';

/**
 * Sets up testing within our game and preserves previously setup instances
 * @param {Object} [state] - Initial game state to merge with fixture
 * @param {Object} [config] - Game configuration to merge with fixture
 */
export function setupGame({ state = {}, config = {} } = {}) {
  const gameConfig = { ...FIXTURES.CONFIG, ...config };
  const initialState = buildInitialState(state, gameConfig);
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

/**
 * Builds the initial state for testing by overriding state and property
 * defaults from fixtures and creating new players
 * @param {Object} state - The state overrides
 * @param {[Object]} state.players - Array of players to create
 * @param {[Object]} state.properties - Array of properties or groups to override
 * @param {Object} config - configuration needed during game creation
 * @returns {Object} A new initial state for testing
 */
function buildInitialState(
  {
    players = [],
    properties = [],
    ...state
  },
  config
) {
  return {
    ...FIXTURES.GAME,
    ...state,

    // map over provided players and set defaults
    players: players.map((player) => ({
      id: slug(`${player.name}_${player.token}`),
      balance: config.playerStart,
      bankrupt: false,
      ...player
    })),

    // loop over provided properties to override defaults
    properties: properties.reduce((mocks, override) => mocks.map((mock) => (
      (mock.id === override.id || mock.group === override.group) ?
        { ...mock, ...override } : mock
    )), FIXTURES.GAME.properties)
  };
}
