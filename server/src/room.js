import {
  randomString,
  createGameState,
  generateNotice
} from './helpers';
import MonopolyError from './error';
import createGame from './game';
import actions from './actions';
import { hydrate } from './actions/hydrate';
import { getPlayerHistories } from './deducers';

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
    save(doc) {
      this.store[doc.id] = doc;
      return Promise.resolve(doc);
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
    const game = createGameState(this.load(theme, 'properties'), config);

    const createGame = () => {
      const id = randomString().toLowerCase();
      return this.database.find(id).then(createGame)
        .catch(() => this.database.save({ id, theme, game, config }));
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

      if (meta && !room.connected.has(meta)) {
        room.connected.add(meta);
        room.trigger('sync', meta);
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
      room: this.id,
      theme: this.theme,
      game: this.game,
      config: this.config,
      players: toArray(this.players.keys())
    };
  }

  /**
   * Game room constructor
   * @param {String} id - Game room ID
   * @param {Object} theme - Game theme
   * @param {Object} game - Game state
   * @param {Object} config - Game config
   */
  constructor({ id, theme, game, config }) {
    this.id = id;
    this.theme = theme;
    this.config = config;
    this.connected = new Set();
    this.players = new Map();
    this.events = new Map();
    this.polls = {};

    this.messages = this.constructor.load(theme, 'messages');
    this.store = createGame(game, config, this.messages);
    this.fresh = true;

    this.deduceGame(this.store.getState());

    this.store.subscribe(() => {
      this.fresh = false;
      this.sync();
    });

    Object.keys(actions).forEach((name) => {
      if (!this[name]) {
        this[name] = (token, ...args) => new Promise((resolve) => {
          if (!this.players.has(token)) {
            throw this.error('player.not-playing');
          }

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

      this.events.forEach((r, event) => {
        this.off(event, meta);
      });

      this.players.forEach((value, token, players) => {
        value === meta && players.delete(token);
      });

      this.trigger('sync', meta);
    }

    // in testing, do not automatically clear cached rooms
    if (this.connected.size === 0 && process.env.NODE_ENV !== 'testing') {
      delete this.constructor._cache[this.id];
    }
  }

  /**
   * Simple event registration
   * @param {String} event - Event to register with
   * @param {Function} callback - Function called on event
   * @param {Mixed} [meta] - Additional meta to register with the callback
   */
  on(event, callback, meta) {
    if (!this.events.has(event)) {
      this.events.set(event, new Map());
    }

    this.events.get(event).set(callback, meta);
  }

  /**
   * Simple event deregistration, if no callback is provided all callbacks
   * for the event will be removed
   * @param {String} event - Event to deregister from
   * @param {Function} [callback] - Function to deregister
   * @param {Mixed} [meta] - Meta to deregister
   */
  off(event, callback, meta = callback) {
    if (this.events && this.events.has(event)) {
      const registry = this.events.get(event);

      if (registry.has(callback)) {
        registry.delete(callback);

      } else if (typeof meta !== 'undefined') {
        registry.forEach((m, cb, reg) => {
          if (meta === m && (meta === callback || cb === callback)) {
            reg.delete(cb);
          }
        });

      } else {
        registry.clear();
      }
    }
  }

  /**
   * Triggers registered events
   * @param {String} event - Event to trigger
   * @param {Mixed} [args] - Arguments to pass to the callbacks
   */
  trigger(event, ...args) {
    if (this.events && this.events.has(event)) {
      this.events.get(event).forEach((m, cb) => cb(...args));
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
    let gameState = this.store.getState();
    this.deduceGame(gameState);

    const sync = () => {
      // no one to blame if we aren't saving
      const blame = save && this.game.notice.meta.player;
      const meta = blame && this.players.get(blame.token);
      this.trigger('sync', meta);
    };

    if (save) {
      this.constructor.database.save({
        id: this.id,
        theme: this.theme,
        config: this.config,
        game: gameState
      }).then(() => {
        this.fresh = true;
        sync();
      });
    } else {
      sync();
    }
  }

  /**
   * Transforms the game state to reflect any relevant history and
   * removes the diff leaf from the state
   * @param {Object} gameState - game state object with diff leaf
   */
  deduceGame(gameState) {
    // eslint-disable-next-line no-unused-vars
    const { diff, ...game } = gameState;
    const playerHistory = getPlayerHistories(gameState);

    // add player history
    const players = game.players._all
      .reduce((players, token) => ({
        ...players,
        [token]: {
          ...players[token],
          history: playerHistory[token]
        }
      }), game.players);

    this.game = { ...game, players };
  }

  /**
   * Reloads the game from the database and syncs it with the room
   */
  refresh() {
    this.constructor.database.find(this.id)
      .then(({ config, game }) => {
        this.fresh = true;
        this.config = config;
        // this will trigger a sync which sets `this.game`
        this.store.dispatch(hydrate(game));
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

      if (player && player.name !== name) {
        return reject(this.error('player.used-token'));
      } else if (player && this.players.has(token)) {
        return reject(this.error('player.playing'));
      }

      this.players.set(token, meta);

      if (!player) {
        this.store.dispatch(actions.join(name, token));
        this.trigger('notice', this.notice('player.joined', { player: { name } }));
      } else {
        this.trigger('sync', meta);
      }

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
          this.trigger('poll:end', { id });
          clearTimeout(poll._timeout);
          delete this.polls[id];
          resolve(res);
        }
      };

      this.trigger('poll:new', { id, message });
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
