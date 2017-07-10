import {
  randomString,
  createGameState,
  generateNotice
} from './helpers';
import MonopolyError from './error';
import setupSocket from './socket';
import createGame from './game';
import actions from './actions';

const { from:toArray } = Array;

/**
 * The game room class
 */
export default class GameRoom {
  static _cache = {};
  static _themes = {};

  /**
   * Default to in-memory persistance
   */
  static db = {
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
   * @param {String} [theme="classic"] - Theme name
   * @param {String} name - Data name
   * @returns {Object} Theme data
   */
  static load(theme, name = theme) {
    if (theme === name) theme = 'classic';
    this._themes[theme] = this._themes[theme] || {};

    if (this.loader && !this._themes[theme][name]) {
      this._themes[theme][name] = this.loader(theme, name);
    }

    return this._themes[theme][name];
  }

  /**
   * Sets properties for the game room to use
   * @param {String} prop - The property name
   * @param {Mixed} value - The property value
   */
  static set(prop, value) {
    this[prop] = value;
  }

  /**
   * Sets up socket for interacting with this class
   * @param {Socket} socket - Socket.io socket instance
   */
  static setup(socket) {
    setupSocket(socket, GameRoom);
  }

  /**
   * Creates a new game state based on a theme
   * @param {Object} [options={}] - Optional custom game options
   * @returns {Promise} A promise that resolves to the new game state
   */
  static new(options = {}) {
    if (!this.db) return Promise.reject('No persistence layer found');

    const config = { ...this.load('config'), ...options };
    const state = createGameState(this.load('properties'), config);

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
    if (!this.db) return Promise.reject('No persistence layer found');

    id = id.toLowerCase();

    return this.db.find(id).then((game) => {
      const room = this._cache[id] || new GameRoom(game);
      room.sockets.add(socket);

      socket.on('disconnect', () => {
        socket.removeAllListeners();

        room.sockets.delete(socket);
        room.players.delete(socket);

        room.sockets.forEach((socket) => {
          socket.emit('room:sync', room.state);
        });

        if (room.sockets.size === 0) {
          delete this._cache[id];
        }
      });

      this._cache[id] = room;
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
    this.id = id;
    this.config = config;
    this.sockets = new Set();
    this.players = new Map();
    this.polls = {};

    this.messages = this.constructor.load('messages');
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

    this.constructor.db.save({
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

      this.sockets.forEach((socket) => {
        socket.emit('room:sync', this.state);
      });

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
   * Sends a message to another player
   * @param {Socket} socket - Socket.io Socket instance
   * @param {String} token - Player token to send the message to
   * @param {String} message - The message to send
   */
  message(socket, toToken, message) {
    const fromToken = this.players.get(socket);
    const toPlayer = toArray(this.players.entries())
      .find((entry) => entry[1] === toToken)[0];

    if (fromToken && toPlayer) {
      toPlayer.emit('message:recieved', fromToken, message);
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
