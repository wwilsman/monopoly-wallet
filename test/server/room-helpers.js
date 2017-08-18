import YAML from 'yamljs';
import {
  before,
  beforeEach,
  afterEach
} from 'mocha';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import ioServer from 'socket.io';
import ioClient from 'socket.io-client';

import {
  createGameState,
  transformGameState
} from '../helpers';
import GameRoom from '../../server/room';
import MonopolyError from '../../server/error';
import connectSocket from '../../server/socket';

// use chai as promised
chai.use(chaiAsPromised);

// fixtures
const CONFIG_FIXTURE = YAML.load('./server/themes/classic/config.yml');
const PROPERTY_FIXTURES = YAML.load('./server/themes/classic/properties.yml');
const MESSAGES_FIXTURE = YAML.load('./server/themes/classic/messages.yml');

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
  let server = null;

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
    server = ioServer(8080);
    server.on('connection', connectSocket);

    GameRoom.database.store[this.room] = {
      id: this.room,
      state: this.game,
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
      server.close(resolve);
    });
  });
}

/**
 * Creates a new socket instance
 * @returns {Socket} Socket.io socket instance
 */
export function createSocket() {
  return ioClient('http://localhost:8080', {
    transports: ['websocket'],
    forceNew: true
  });
}

/**
 * Connects a socket to a game room
 * @param {Socket} socket - Socket.io socket instance
 * @param {String} gameID - Game room ID
 * @returns {Promise} Resolves once connected
 */
export function connectToGameRoom(socket, gameID) {
  return promisifySocketEvent(socket, {
    emit: 'room:connect',
    resolve: 'room:connected',
    reject: 'game:error'
  })(gameID);
}

/**
 * Connects a socket to a game room
 * @param {Socket} socket - Socket.io socket instance
 * @param {String} name - Player name
 * @param {String} token - Player token
 * @returns {Promise} Resolves once player has joined
 */
export function joinGameRoom(socket, name, token) {
  return promisifySocketEvent(socket, {
    emit: 'game:join',
    resolve: 'game:joined',
    reject: 'game:error'
  })(name, token);
}

/**
 * Creats a socket and connects it to a game room
 * @param {gameID} gameID - Game room ID
 * @returns {Promise} Resolves once connected
 */
export async function createSocketAndConnect(gameID) {
  const socket = createSocket();
  await connectToGameRoom(socket, gameID);
  return socket;
}

/**
 * Creates a socket and joins the game room
 * @param {Socket} socket - Socket.io socket instance
 * @param {String} name - Player name
 * @param {String} token - Player token
 * @returns {Promise} Resolves once the player has joined
 */
export async function createSocketAndJoinGame(gameID, token) {
  const socket = await createSocketAndConnect(gameID);
  const game = await GameRoom.database.find(gameID);

  if (!game.state.players[token]) {
    game.state.players[token] = {
      name: `Player ${game.state.players._all.length + 1}`,
      balance: game.config.playerStart,
      bankrupt: false,
      token
    };

    GameRoom._cache[gameID].refresh();
  }

  const name = game.state.players[token].name;
  await joinGameRoom(socket, name, token);
  return socket;
}

/**
 * Promisifies a socket emit event that resolves or rejects on other events
 * @param {Socket} socket - Socket.io socket instance
 * @param {String} emitEvent - Event name to emit when the return function is called
 * @param {String} resolveEvent - Event name to resolve the resulting promise
 * @param {String} rejectEvent - Event name to reject the resulting promise
 * @returns {Function} Called with event args will return a promise that
 * resolves or rejects on option events
 */
export function promisifySocketEvent(socket, {
  emit:emitEvent,
  resolve:resolveEvent,
  reject:rejectEvent
}) {
  return (...args) => new Promise((resolve, reject) => {
    const handleResolve = (...payload) => off() && resolve(...payload);
    const handleReject = (error) => off() && reject(createError(error));

    const off = () => socket
      .off(resolveEvent, handleResolve)
      .off(rejectEvent, handleReject);

    socket.on(resolveEvent, handleResolve);
    socket.on(rejectEvent, handleReject);
    socket.emit(emitEvent, ...args);
  });
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
