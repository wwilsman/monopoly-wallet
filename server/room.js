import YAML from 'yamljs';

import { randomString, generateNotice } from './helpers';
import { createState, createGame } from './game';
import MonopolyError from './error';
import actions from './actions';

const { from:toArray } = Array;

// theme cache so we don't have to read from the filesystem every time
let THEME_CACHE = {};

// room cache so multiple players can use same room instance
let ROOM_CACHE = {};

/**
 * The game room class
 */
export default class GameRoom {
  static db;

  /**
   * Sets up a persistence layer for rooms to use
   * @param {Object} db - The persistence layer
   */
  static persist(db) {
    this.db = db;
  }

  /**
   * Creates a new game state based on a theme
   * @param {Object} [options={}] - Optional custom game options
   * @returns {Promise} A promise that resolves to the new game state
   */
  static new(options = {}) {
    if (!this.db) {
      return Promise.reject('No persistence layer found');
    }

    const theme = loadTheme();
    const config = { ...theme.config, ...options };
    const state = createState(theme.properties, config);

    const createGame = () => {
      const id = randomString().toLowerCase();
      return this.db.find(id).then(createGame)
        .catch(() => this.db.save({ id, state, config }));
    };

    return createGame();
  }

  /**
   * Connects to an existing game room
   * @param {String} id - Game room ID
   * @returns {Promise} Resolves to the game room instance
   */
  static connect(socket, id) {
    if (!this.db) {
      return Promise.reject('No persistence layer found');
    }

    id = id.toLowerCase();

    return this.db.find(id).then((game) => {
      const room = ROOM_CACHE[id] || new GameRoom(game);
      room.sockets.set(socket.id, socket);

      socket.once('disconnect', () => {
        room.sockets.delete(socket.id);
        room.players.delete(socket);

        if (room.sockets.size === 0) {
          delete ROOM_CACHE[id];
        }
      });

      ROOM_CACHE[id] = room;
      return room;
    });
  }

  /**
   * Game room constructor
   * @param {String} id - Game room ID
   * @param {Object} state - Game state
   * @param {Object} config - Game config
   */
  constructor({ id, state, config }) {
    this.db = this.constructor.db;

    this.id = id;
    this.config = config;
    this.sockets = new Map();
    this.players = new Map();
    this.polls = {};

    this.messages = loadMessages();
    this.store = createGame(state, config, this.messages);
    this.game = this.store.getState();

    this.store.subscribe(() => this.sync());

    Object.keys(actions).forEach((name) => {
      if (!this[name]) {
        this[name] = (socket, ...args) => new Promise((resolve) => {
          const token = this.players.get(socket);
          if (!token) throw this.error('player.not-playing');
          this.store.dispatch(actions[name](token, ...args));
          resolve();
        });
      }
    });
  }

  /**
   * Game id, state, config, and active players
   * @returns {Object} - Overrall room state
   */
  get state() {
    return {
      id: this.id,
      state: this.game,
      config: this.config,
      players: toArray(this.players.values())
    };
  }

  /**
   * Syncs the game state with the store and emits a sync event to all players
   */
  sync() {
    this.game = this.store.getState();

    this.db.save({
      id: this.id,
      state: this.game,
      config: this.config
    }).then(() => {
      this.emit('game:sync', this.game);
    });
  }

  /**
   * Joins the game and adds the socket to the room
   * @param {Socket} socket - Socket.io socket instance
   * @param {String} name - Player name
   * @param {String} token - Player token
   * @returns {Promsie} Resolves after adding the player
   */
  join(socket, name, token) {
    return new Promise((resolve, reject) => {
      const player = this.game.players[token];

      if (player) {
        if (player.name !== name) {
          return reject(this.error('player.used-token'));
        } else if (toArray(this.players.values()).indexOf(token) > -1) {
          return reject(this.error('player.playing'));
        }
      } else {
        this.store.dispatch(actions.join(name, token));
      }

      this.players.set(socket, token);
      return resolve();
    });
  }

  /**
   * Polls current active players
   * @param {String} message - Message to send to players about the poll
   * @returns {Promise} Resolves once all active players have votes or after timing out
   */
  poll(message) {
    return new Promise((resolve) => {
      const pollID = randomString();

      const poll = this.polls[pollID] = {
        votes: toArray(this.players.keys()).reduce(
          (map, token) => map.set(token, 0),
          new Map()
        ),

        resetTimeout: () => {
          clearTimeout(poll._timeout);

          poll._timeout = setTimeout(() => {
            poll.done(false);
          }, this.config.pollTimeout);
        },

        done: (res) => {
          clearTimeout(poll._timeout);
          delete this.polls[pollID];
          resolve(res);
        }
      };

      poll.resetTimeout();
      this.emit('poll:new', pollID, message);
    });
  }

  /**
   * Places a vote in an ongoing poll
   * @param {Socket} socket - Socket.io Socket instance
   * @param {String} pollID - Poll ID
   * @param {Boolean} vote - Whether to vote yes or no
   */
  vote(socket, pollID, vote) {
    const poll = this.polls[pollID];

    if (poll && poll.votes.has(socket)) {
      poll.votes.set(socket, vote ? 1 : -1);
      const votes = toArray(poll.votes.values());
      const total = votes.reduce((t, v) => t += v ? 1 : 0, 0);
      const tally = votes.reduce((t, v) => t += v, 0);

      if (total === votes.length) {
        poll.done(tally > 0);
      } else {
        poll.resetTimeout();
      }
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
   * Emits an event to all active players in the room
   * @param {String} event - Event name to emit
   * @param {Mixed} payload - Arguments to emit
   */
  emit(event, ...payload) {
    this.players.forEach((_, player) => {
      player.emit(event, ...payload);
    });
  }
}

/**
 * Loads game files for a specific theme and caches them
 * @param {String} [name='classic'] Theme name
 * @returns {Object} All necessary theme data
 */
function loadTheme(name = 'classic') {
  const root = `./server/themes/${name}`;
  const theme = THEME_CACHE[name] = THEME_CACHE[name] || {};

  theme.config = theme.config || YAML.load(`${root}/config.yml`);
  theme.properties = theme.properties || YAML.load(`${root}/properties.yml`);

  return theme;
}

/**
 * Loads game message for a specific theme and caches them
 * @param {String} [name='classic'] Theme name
 * @returns {Object} Theme messages
 */
function loadMessages(themeName = 'classic') {
  const path = `./server/themes/${themeName}/messages.yml`;
  const theme = THEME_CACHE[themeName] = THEME_CACHE[themeName] || {};

  return theme.messages = theme.messages || YAML.load(path);
}
