import {
  before,
  after,
  beforeEach,
  afterEach
} from 'mocha';

import {
  GAME_FIXTURE,
  CONFIG_FIXTURE,
  NOTICES_FIXTURE
} from './fixtures';

import {
  createGame
} from '../../server/game';
import {
  getPlayer,
  getProperty,
  getProperties,
  getTradeId
} from '../../server/helpers';

/**
 * Sets up testing context for a new game store instance each test
 * @param {Object} [state] - Initial game state to merge with fixture
 * @param {Object} [config] - Game configuration to merge with fixture
 */
export function setupGameForTesting({ state = {}, config = {} } = {}) {
  before(function() {
    this.config = { ...CONFIG_FIXTURE, ...config };
    this.initial = extendGameState(GAME_FIXTURE, state, this.config);
  });

  after(function() {
    this.initial = null;
    this.config = null;
  });

  setupGameStore();
}

/**
 * Modifies the current game state before the store is instantiated.
 * Retains and restores the previous game state
 * @param {Object} [state] - Initial game state to merge with fixture
 * @param {Object} [config] - Game configuration to merge with fixture
 */
export function modifyGameInTesting({ state = {}, config = {} } = {}) {
  let old = {};

  before(function() {
    old.initial = this.initial;
    old.config = this.config;

    this.config = { ...old.config, ...config };
    this.initial = extendGameState(this.initial, state, this.config);
  });

  after(function() {
    this.initial = old.initial;
    this.config = old.config;
    old = null;
  });

  setupGameStore();
}

/**
 * Sets up the game store instance for testing and preserves/restores
 * any previous instances.
 */
function setupGameStore() {
  let store, unsubscribe, old = {};

  beforeEach(function() {
    old.last = this.last;
    old.state = this.state;
    old.dispatch = this.dispatch;
    old.getPlayer = this.getPlayer;
    old.getProperty = this.getProperty;
    old.getProperties = this.getProperties;

    store = createGame(
      this.initial,
      this.config,
      NOTICES_FIXTURE
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
    this.last = old.last;
    this.state = old.state;
    this.dispatch = old.dispatch;
    this.getPlayer = old.getPlayer;
    this.getProperty = old.getProperty;
    this.getProperties = old.getProperties;

    unsubscribe();
    unsubscribe = null;
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
function extendGameState(state, overrides, config) {
  return {
    ...state,
    ...overrides,

    // override existing players by id or create new ones
    players: (overrides.players||[]).reduce((players, override) => ({
      ...players,

      [override.token]: players[override.token] ? {
        ...players[override.token],
        ...override
      } : {
        name: override.name || `Player ${Object.keys(players).length + 1}`,
        balance: override.balance || config.playerStart,
        bankrupt: override.bankrupt || false,
        ...override
      }
    }), JSON.parse(JSON.stringify(state.players))),

    // override existing properties by id or group
    properties: (overrides.properties||[]).reduce((properties, override) => {
      if (override.group) {
        properties._all.forEach((propertyId) => {
          if (properties[propertyId].group === override.group) {
            properties[propertyId] = {
              ...properties[propertyId],
              ...override
            };
          }
        });
      } else if (override.id) {
        properties[override.id] = {
          ...properties[override.id],
          ...override
        };
      }

      return properties;
    }, JSON.parse(JSON.stringify(state.properties))),

    // override exisiting trades or create new ones
    trades: (overrides.trades||[]).reduce((trades, override) => {
      const id = getTradeId(override.from, override.with);

      return {
        ...trades,

        [id]: trades[id] ? {
          ...trades[id],
          ...override
        } : {
          from: override.from,
          with: override.with,
          properties: override.properties || [],
          amount: override.amount || 0
        }
      };
    }, JSON.parse(JSON.stringify(state.trades))),

    // override existing auction or create a new one
    auction: overrides.auction ?
      state.auction ? {
        ...JSON.parse(JSON.stringify(state.auction)),
        ...overrides.auction
      } : {
        players: Object.keys(state.players)
          .concat((overrides.players||[]).map((pl) => pl.token))
          .filter((token, i, players) => players.indexOf(token) === i),
        winning: false,
        amount: 0,
        ...overrides.auction
      } :
    typeof overrides.auction === 'undefined' ?
      state.auction : false
  };
}
