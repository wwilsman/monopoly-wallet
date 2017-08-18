import {
  randomString,
  createGameState,
  generateNotice
} from './helpers';
import MonopolyError from './error';
import createGame, { hydrate } from './game';
import actions from './actions';

const { from:toArray } = Array;
const isFn = (obj) => typeof obj === 'function';

/**
 * The game room class
 */
export default class GameRoom {
  static _cache = {};
  static _themes = {};

  /**
   * Default to in-memory persistance
   */
  static database = {
    store: {},

    find(id) {
      return this.store[id] ? Promise.resolve(this.store[id]) :
        Promise.reject(new MonopolyError('Game not found'));
    },
    save(game) {
      this.store[game.id] = game;
      return Promise.resolve(game);
    }
  };

  /**
   * Loads and caches a theme
   * @param {String} theme - Theme name
   * @param {String} name - Data name
   * @returns {Object} Theme data
   */
  static load(theme, name) {
    this._themes[theme] = this._themes[theme] || {};

    if (this.loader && !this._themes[theme][name]) {
      this._themes[theme][name] = this.loader(theme, name);
    }

    return this._themes[theme][name];
  }

  /**
   * Sets the loader and database for a game room to use
   * @param {String} prop - "loader" or "database"
   * @param {Mixed} value - Value of "loader" or "database"
   */
  static set(prop, value) {
    if (prop === 'database') {
      if (!value || !isFn(value.find) && !isFn(value.save)) {
        throw new TypeError(`The ${prop} must implement find() & save()`);
      }
    } else if (prop === 'loader') {
      if (!value || !isFn(value)) {
        throw new TypeError(`The ${prop} must be a function`);
      }
    } else {
      throw new TypeError(`Unknown property "${prop}"`);
    }

    this[prop] = value;
  }

  /**
   * Creates a new game state based on a theme
   * @param {String} [theme="classic"] - Theme name
   * @param {Object} [options={}] - Custom game options
   * @returns {Promise} A promise that resolves to the new game state
   */
  static new({ theme = 'classic', ...options } = {}) {
    if (!this.database) {
      return Promise.reject('No persistence layer found');
    }

    const config = { ...this.load(theme, 'config'), ...options };
    const state = createGameState(this.load(theme, 'properties'), config);

    const createGame = () => {
      const id = randomString().toLowerCase();
      return this.database.find(id).then(createGame)
        .catch(() => this.database.save({ id, theme, state, config }));
    };

    return createGame();
  }

  /**
   * Connects to an existing game room
   * @param {String} id - Game room ID
   * @param {Mixed} [meta] - Meta to connect to the game
   * @returns {Promise} Resolves to the game room instance
   */
  static connect(id, meta) {
    id = id.toLowerCase();

    if (!this.database) {
      return Promise.reject('No persistence layer found');
    }

    return this.database.find(id).then((game) => {
      const room = this._cache[id] || new GameRoom(game);

      if (meta) {
        room.connected.add(meta);
        room.trigger('sync');
      }

      this._cache[id] = room;
      return room;
    });
  }

  /**
   * Game id, state, config, and active players
   * @returns {Object} - Overrall room state
   */
  get state() {
    return {
      id: this.id,
      theme: this.theme,
      state: this.game,
      config: this.config,
      players: toArray(this.players.keys())
    };
  }

  /**
   * Game room constructor
   * @param {String} id - Game room ID
   * @param {Object} theme - Game theme
   * @param {Object} state - Game state
   * @param {Object} config - Game config
   */
  constructor({ id, theme, state, config }) {
    this.id = id;
    this.theme = theme;
    this.config = config;
    this.connected = new Set();
    this.players = new Map();
    this.polls = {};

    this.messages = this.constructor.load(theme, 'messages');
    this.store = createGame(state, config, this.messages);
    this.game = this.store.getState();
    this.fresh = true;

    this.store.subscribe(() => this.sync());

    Object.keys(actions).forEach((name) => {
      if (!this[name]) {
        this[name] = (token, ...args) => new Promise((resolve) => {
          if (!this.players.has(token)) {
            throw this.error('player.not-playing');
          }

          this.fresh = false;
          this.store.dispatch(actions[name](token, ...args));
          resolve();
        });
      }
    });
  }

  /**
   * Disconnects from a game room
   * @param {Mixed} [meta] - Meta to remove from the room
   */
  disconnect(meta) {
    if (meta) {
      this.connected.delete(meta);

      this.players.forEach((token, value, players) => {
        value === meta && players.delete(token);
      });

      this.trigger('sync');
    }

    if (this.connected.size === 0) {
      delete this.constructor._cache[this.id];
    }
  }

  /**
   * Simple event registration
   * @param {String} event - Event to register with
   * @param {Function} cb - Function called on event
   */
  on(event, cb) {
    this._events = this._events || {};
    this._events[event] = this._events[event] || new Set();
    this._events[event].add(cb);
  }

  /**
   * Simple event deregistration, if no callback is provided all callbacks
   * for the event will be removed
   * @param {String} event - Event to deregister from
   * @param {Function} [cb] - Function to deregister
   */
  off(event, cb) {
    if (this._events && this._events[event]) {
      if (cb) {
        this._events[event].delete(cb);
      } else {
        this._events[event].clear();
      }
    }
  }

  /**
   * Triggers registered events
   * @param {String} event - Event to trigger
   * @param {Mixed} [args] - Arguments to pass to the callbacks
   */
  trigger(event, ...args) {
    if (this._events && this._events[event]) {
      this._events[event].forEach((cb) => cb(...args));
    }
  }

  /**
   * Generates a notice
   * @param {String} id - The notice ID
   * @param {Object} [meta] - Meta used to generate the message
   * @returns {String} The generated notice
   */
  notice(id, meta) {
    return generateNotice(`notices.${id}`, meta, this.messages);
  }

  /**
   * Generates a monopoly error
   * @param {String} id - The error message ID
   * @param {Object} [meta] - Meta used to generate the error message
   * @returns {MonopolyError} A new monopoly error with the generated message
   */
  error(id, meta) {
    return new MonopolyError(
      generateNotice(`errors.${id}`, meta, this.messages)
    );
  }

  /**
   * Syncs the game state with the store and emits a sync event
   * @param {Boolean} [save] - Whether to save the game or not, defaults
   * to false if the room state is fresh, otherwise true
   */
  sync(save = !this.fresh) {
    const sync = () => this.trigger('sync');
    this.game = this.store.getState();

    if (save) {
      this.constructor.database.save({
        id: this.id,
        state: this.game,
        config: this.config
      }).then(() => {
        this.fresh = true;
        sync();
      });
    } else {
      sync();
    }
  }

  /**
   * Reloads the game from the database
   * triggers this.sync() via dispatching, but since we just loaded the game we don't need to save it again, so we flag the room as being "fresh"
   */
  refresh() {
    this.constructor.database.find(this.id)
      .then(({ config, state }) => {
        this.fresh = true;
        this.config = config;
        this.store.dispatch(hydrate(state));
      });
  }

  /**
   * Joins the game and adds the player meta to the room
   * @param {String} name - Player name
   * @param {String} token - Player token
   * @param {Mixed} [meta] - Player meta
   * @returns {Promsie} Resolves after adding the player
   */
  join(name, token, meta) {
    return new Promise((resolve, reject) => {
      const player = this.game.players[token];

      if (player) {
        if (player.name !== name) {
          return reject(this.error('player.used-token'));
        } else if (this.players.has(token)) {
          return reject(this.error('player.playing'));
        }
      } else {
        this.store.dispatch(actions.join(name, token));
      }

      this.players.set(token, meta);
      this.trigger('sync');
      return resolve();
    });
  }

  /**
   * Polls current active players
   * @param {String} message - Message to send to players about the poll
   * @returns {Promise} Resolves once all active players have votes or
   * after timing out
   */
  poll(message) {
    const { pollTimeout } = this.config;

    return new Promise((resolve) => {
      const id = randomString();
      const poll = this.polls[id] = {
        votes: toArray(this.players.keys()).reduce(
          (map, token) => map.set(token, 0),
          new Map()
        ),

        reset: () => {
          clearTimeout(poll._timeout);
          poll._timeout = setTimeout(() => {
            poll.done(false);
          }, pollTimeout);
        },

        done: (res) => {
          clearTimeout(poll._timeout);
          delete this.polls[id];
          resolve(res);
        }
      };

      this.trigger('poll', { id, message });
      poll.reset();
    });
  }

  /**
   * Places a vote in an ongoing poll
   * @param {String} token - Player to vote
   * @param {String} id - Poll ID
   * @param {Boolean} vote - Whether to vote yes or no
   */
  vote(token, id, vote) {
    const poll = this.polls[id];

    if (poll && poll.votes.has(token)) {
      poll.votes.set(token, vote ? 1 : -1);
      const votes = toArray(poll.votes.values());
      const total = votes.reduce((t, v) => t += v ? 1 : 0, 0);
      const tally = votes.reduce((t, v) => t += v, 0);

      if (total === votes.length) {
        poll.done(tally > 0);
      } else {
        poll.reset();
      }
    }
  }
}
