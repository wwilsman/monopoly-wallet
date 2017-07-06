import YAML from 'yamljs';
import {
  before,
  beforeEach,
  afterEach
} from 'mocha';

import {
  createState,
  createGame
} from '../../server/game';
import {
  getPlayer,
  getProperty,
  getProperties,
  getTradeId
} from '../../server/helpers';

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
    this.initial = extendGameState(null, state, this.config);
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
    this.initial = extendGameState(this.initial, state, this.config);
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

/**
 * Extends a game state with transforms
 * @param {Object} [state] - The state to extend or create a new state
 * @param {[Object]} transforms.players - Array of players to create
 * @param {[Object]} transforms.properties - Array of properties or groups to override
 * @param {Object} config - configuration needed during game creation
 * @returns {Object} A new initial state for testing
 */
export function extendGameState(state, transforms, config) {
  if (!state) state = createState(PROPERTY_FIXTURES, config);

  return {
    ...state,
    ...transforms,

    // transform existing players by id or create new ones
    players: (transforms.players||[]).reduce((players, transform) => ({
      ...players,

      [transform.token]: players[transform.token] ? {
        ...players[transform.token],
        ...transform
      } : {
        name: transform.name || `Player ${Object.keys(players).length + 1}`,
        balance: transform.balance || config.playerStart,
        bankrupt: transform.bankrupt || false,
        ...transform
      }
    }), JSON.parse(JSON.stringify(state.players))),

    // transform existing properties by id or group
    properties: (transforms.properties||[]).reduce((properties, transform) => {
      if (transform.group) {
        properties._all.forEach((propertyId) => {
          if (properties[propertyId].group === transform.group) {
            properties[propertyId] = {
              ...properties[propertyId],
              ...transform
            };
          }
        });
      } else if (transform.id) {
        properties[transform.id] = {
          ...properties[transform.id],
          ...transform
        };
      }

      return properties;
    }, JSON.parse(JSON.stringify(state.properties))),

    // transform exisiting trades or create new ones
    trades: (transforms.trades||[]).reduce((trades, transform) => {
      const id = getTradeId(transform.from, transform.with);

      return {
        ...trades,

        [id]: trades[id] ? {
          ...trades[id],
          ...transform
        } : {
          from: transform.from,
          with: transform.with,
          properties: transform.properties || [],
          amount: transform.amount || 0
        }
      };
    }, JSON.parse(JSON.stringify(state.trades))),

    // transform existing auction or create a new one
    auction: transforms.auction ?
      state.auction ? {
        ...JSON.parse(JSON.stringify(state.auction)),
        ...transforms.auction
      } : {
        players: Object.keys(state.players)
          .concat((transforms.players||[]).map((pl) => pl.token))
          .filter((token, i, players) => players.indexOf(token) === i),
        winning: false,
        amount: 0,
        ...transforms.auction
      } :
    typeof transforms.auction === 'undefined' ?
      state.auction : false
  };
}
