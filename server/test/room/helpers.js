import YAML from 'yamljs';
import WebSocket from 'ws';
import {
  before,
  beforeEach,
  afterEach
} from 'mocha';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import {
  createGameState,
  transformGameState
} from '../helpers';
import GameRoom from '../../src/room';
import MonopolyError from '../../src/error';
import connectSocket from '../../src/socket';

// use chai as promised
chai.use(chaiAsPromised);

// fixtures
const CONFIG_FIXTURE = YAML.load('./themes/classic/config.yml');
const PROPERTY_FIXTURES = YAML.load('./themes/classic/properties.yml');
const MESSAGES_FIXTURE = YAML.load('./themes/classic/messages.yml');

// always use fixtures for themes
GameRoom.set('loader', (theme, name) => {
  switch (name) {
    case 'config': return CONFIG_FIXTURE;
    case 'properties': return PROPERTY_FIXTURES;
    case 'messages': return MESSAGES_FIXTURE;
  }
});

/**
 * Starts the server and adds mock data
 * @param {Object} [game={}] - Game state transforms
 * @param {Object} [config={}] - Custom game configuration
 * @param {Function} [beforeEach] - Before each callback
 * @param {Function} [afterEach] - After each callback
 */
export function setupRoomForTesting({
  game = {},
  config = {},
  beforeEach:beforeEachCB,
  afterEach:afterEachCB
} = {}) {
  let wss = null;

  before(function() {
    this.room = 't35tt';

    this.config = {
      ...CONFIG_FIXTURE,
      ...config,
      // always use low timeouts in tests
      pollTimeout: 10
    };

    this.game = createGameState(PROPERTY_FIXTURES, this.config);
    this.game = transformGameState(this.game, game, this.config);
  });

  beforeEach(async function() {
    await new Promise((resolve) => {
      wss = new WebSocket.Server({ port: 8080 }, resolve);
    });

    wss.on('connection', connectSocket);

    GameRoom.database.store[this.room] = {
      id: this.room,
      theme: 'classic',
      game: this.game,
      config: this.config
    };

    if (beforeEachCB) {
      await beforeEachCB.call(this);
    }
  });

  afterEach(async function() {
    if (afterEachCB) {
      await afterEachCB.call(this);
    }

    return new Promise((resolve) => {
      delete GameRoom.database.store[this.room];
      wss.close(resolve);
    });
  });
}

/**
 * Creates a new socket instance
 * @returns {Promise} resolves to the WebSocket once open
 */
export function createSocket() {
  return new Promise((resolve) => {
    let ws = new WebSocket('http://localhost:8080');
    ws.once('open', () => resolve(ws));
  });
}

/**
 * Emits an event via a websocket paylaod
 * @param {WebSocket} ws - WebSocket instance
 * @param {String} event - Event name
 * @param {Mixed} ...args - Arguments to send with the event
 */
export function emitSocketEvent(ws, event, ...args) {
  ws.send(JSON.stringify({ event, args }));
}

/**
 * Creates a promise that resolves when the supplied handler returns a
 * value, otherwise the promise rejects when an error-like object is
 * passed as the event argument of the event
 *
 * @param {WebSocket} ws - WebSocket instance
 * @param {Function} handler - A function called when an event is received
 * @returns {Promise} resolves when the handler returns, otherwise
 * rejects when an error-like object is passed as the event argument
 */
export function handleSocketEvent(ws, handler) {
  return new Promise((resolve, reject) => {
    ws.on('message', (payload) => {
      let { name, data } = JSON.parse(payload);
      let ret = handler(name, data);

      if (typeof ret !== 'undefined') {
        resolve(ret);
      } else if (data && data.error) {
        reject(createError(data.error));
      }
    });
  });
}

/**
 * Promises that an event will be received
 * @param {WebSocket} ws - WebSocket instance
 * @param {String} event - The event to handle
 * @param {Function} [resolver=identity] - Resolves the event arguments
 * @returns {Function} `emitSocketEvent` that returns the handler
 * promise which resolves with the event arguments
 */
export function promisifySocketEvent(ws, event, resolver = (i) => i) {
  return handleSocketEvent(ws, (evt, ...args) => {
    if (evt === event) return resolver(...args) || args[0];
  });
}

/**
 * Emits a create game event and resolves when the game is created
 * @param {WebSocket} ws - WebSocket instaice
 * @returns {Promise} Resolves when the game is created
 */
export function createGame(ws) {
  let promised = promisifySocketEvent(ws, 'game:created');
  emitSocketEvent(ws, 'game:new');
  return promised;
}

/**
 * Emits a connect event and resolves when the socket has connected
 * @param {WebSocket} ws - WebSocket instance
 * @param {String} room - Game room ID
 * @returns {Promise} Resolves when the socket is connected
 */
export function connectToGameRoom(ws, room) {
  let promised = promisifySocketEvent(ws, 'room:connected');
  emitSocketEvent(ws, 'room:connect', room);
  return promised;
}

/**
 * Emits a join event and resolves when the player joins
 * @param {WebSocket} ws - WebSocket instance
 * @param {String} name - Player name
 * @param {String} token - Player token
 * @returns {Promise} Resolves when the player has joined
 */
export function joinGameRoom(ws, name, token) {
  let join = promisifySocketEvent(ws, 'game:joined');
  emitSocketEvent(ws, 'game:join', name, token);
  return join;
}

/**
 * Votes in the very next poll and resolves
 * @param {WebSocket} ws - WebSocket instance
 * @param {Boolean} vote - yes or no (true or false)
 * @returns {Promise} Resolves after the vote is emitted
 */
export function voteInNextPoll(ws, vote) {
  return promisifySocketEvent(ws, 'poll:new').then(({ poll }) => {
    emitSocketEvent(ws, 'poll:vote', poll.id, vote);
  });
}


/**
 * Creates a socket and resolves to it after connecting to a game room
 * @param {String} room - Game room ID
 * @returns {Promise} Resolves to the new WebSocket after it has
 * connected to the game room
 */
export async function createSocketAndConnect(room) {
  let ws = await createSocket();
  let connect = promisifySocketEvent(ws, 'room:connected');
  emitSocketEvent(ws, 'room:connect', room);
  return connect.then(() => ws);
}

/**
 * Creates a socket and resolves to it after joining a game
 * @param {String} room - Game room ID
 * @param {String} token - Player token
 * @returns {Promise} Resolves to the new WebSocket after it has
 * joined the game
 */
export async function createSocketAndJoinGame(room, token) {
  let ws = await createSocketAndConnect(room);
  let { game, config } = await GameRoom.database.find(room);

  if (!game.players[token]) {
    game.players._all.push(token);
    game.players[token] = {
      name: `Player ${game.players._all.length + 1}`,
      balance: config.playerStart,
      bankrupt: false,
      token
    };

    GameRoom._cache[room].refresh();
  }

  let name = game.players[token].name;
  return joinGameRoom(ws, name, token).then(() => ws);
}

/**
 * Helper that creates a new error from error-like objects
 * @param {Object} error - Error-like object with `name` and `message` properties
 * @returns {Error} A new error instance
 */
function createError(error) {
  let Err;

  if (typeof error === 'string') {
    error = { name: 'Error', message: error };
  }

  if (error.name === 'MonopolyError') {
    Err = MonopolyError;
  } else {
    Err = global[error.name] || Error;
  }

  return new Err(error.message);
}
