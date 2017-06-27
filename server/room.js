import YAML from 'yamljs';

import { randomString } from './helpers';
import { createState, createGame } from './game';

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
  }

  get state() {
    return {
      id: this.id,
      state: this.game,
      config: this.config,
      players: toArray(this.players.values())
    };
  }

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

  poll(message) {
    return new Promise((resolve) => {
      const pollID = randomString();

      this.polls[pollID] = {
        votes: toArray(this.players.keys()).reduce(
          (map, token) => map.set(token, 0),
          new Map()
        ),

        done: (res) => {
          delete this.polls[pollID];
          resolve(res);
        }
      };

      this.emit('poll:new', pollID, message);
    });
  }

  vote(socket, pollID, vote) {
    const poll = this.polls[pollID];

    if (poll && poll.votes.has(socket)) {
      poll.votes.set(socket, vote ? 1 : -1);
      const votes = toArray(poll.votes.values());
      const total = votes.reduce((t, v) => t += v ? 1 : 0, 0);
      const tally = votes.reduce((t, v) => t += v, 0);

      if (total === votes.length) {
        poll.done(tally > 0);
      }
    }
  }

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

  return THEME_CACHE[name] = THEME_CACHE[name] || {
    config: YAML.load(`${root}/config.yml`),
    properties: YAML.load(`${root}/properties.yml`)
  };
}

/**
 * Loads game message for a specific theme and caches them
 * @param {String} [name='classic'] Theme name
 * @returns {Object} Theme messages
 */
function loadMessages(themeName = 'classic') {
  const path = `./server/themes/${themeName}/messages.yml`;
  THEME_CACHE[themeName] = THEME_CACHE[themeName] || {};

  return THEME_CACHE[themeName].messages =
    THEME_CACHE[themeName].messages || YAML.load(path);
}
