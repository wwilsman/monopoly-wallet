import React from 'react';
import {
  render,
  unmountComponentAtNode
} from 'react-dom';

import chai from 'chai';
import chaiJQuery from 'chai-jquery';
import chaiAsPromised from 'chai-as-promised';
import $ from 'jquery';

import {
  describe,
  beforeEach,
  afterEach,
  pauseTest,
  visit,
  emit,
  convergeOn
} from './test-helpers';
import {
  createGameState,
  transformGameState
} from '../helpers';

import WebSocket from './mock-websocket';

import GameRoom from '../../server/room';
import connectSocket from '../../server/socket';
import AppRoot from '../../app/root';

import CONFIG_FIXTURE from '../../server/themes/classic/config.yml';
import PROPERTY_FIXTURES from '../../server/themes/classic/properties.yml';
import MESSAGES_FIXTURE from '../../server/themes/classic/messages.yml';

// use chai jquery matchers
chai.use((chai, utils) => chaiJQuery(chai, utils, $));
// and chai as promised
chai.use(chaiAsPromised);

// always use fixtures for themes
GameRoom.set('loader', (theme, name) => {
  switch (name) {
    case 'config': return CONFIG_FIXTURE;
    case 'properties': return PROPERTY_FIXTURES;
    case 'messages': return MESSAGES_FIXTURE;
  }
});

window.WebSocket = WebSocket;

/**
 * Starts a mock websocket server and mounts our app
 * @param {String} name - Name of the test suite
 * @param {Function} setup - suite definition
 */
export function describeApplication(name, setup) {
  describe(name, function() {
    let rootElement, unsubscribeFromStore;

    // mock a basic game
    mockGame();

    // app setup
    beforeEach(function() {

      // create the app root DOM node
      rootElement = document.createElement('div');
      rootElement.id = 'testing-root';
      document.body.appendChild(rootElement);

      // setup a mock websocket server
      this.io = new WebSocket.Server(`ws://${window.location.host}`);
      this.io.on('connection', connectSocket);

      // mount our app
      this.app = render(<AppRoot test/>, rootElement);

      // useful things to assert against
      this.state = this.app.store.getState();
      this.location = this.state.router.location;

      // keep local contexts up to date with the app
      unsubscribeFromStore = this.app.store.subscribe(() => {
        this.state = this.app.store.getState();
        this.location = this.state.router.location;
      });

      // helpers specific to this context
      this.visit = visit.bind(undefined, this.app.history.push);
      this.emit = emit.bind(undefined, this.app.socket);
      this.pauseTest = pauseTest;

      // wait until our app has finished loading
      return convergeOn(() => {
        chai.expect(this.state.app.waiting).to.not.include('connected');
      });
    });

    // teardown
    afterEach(function() {
      unsubscribeFromStore();
      unsubscribeFromStore = null;

      unmountComponentAtNode(rootElement);
      document.body.removeChild(rootElement);
      rootElement = null;

      this.io.close();

      // sometimes our context can hang around
      this.visit = null;
      this.pauseTest = null;
      this.location = null;
      this.state = null;
      this.app = null;
      this.io = null;
    });

    // passthrough to our tests
    setup.call(this);
  });
}

/**
 * Creates a mock game to test against.
 * Preserves any previous existing game.
 * @param {String} [id="t35tt"] - Game ID
 * @param {Object} [state={}] - Game state transforms
 * @param {Object} [config={}] - Custom game configuration
 */
export function mockGame({
  id = 't35tt',
  state = {},
  config = {}
} = {}) {
  let old;

  config = { ...CONFIG_FIXTURE, ...config };
  state = transformGameState(
    createGameState(PROPERTY_FIXTURES, config),
    state, config
  );

  beforeEach(function() {
    Object.defineProperty(this, 'room', {
      get() { return getRoom(id); },
      configurable: true
    });

    old = GameRoom.database.store[id];
    GameRoom.database.store[id] = {
      id,
      theme: 'classic',
      game: state,
      config
    };

    if (this.room.refresh) {
      this.room.refresh();
    }
  });

  afterEach(function() {
    if (old) {
      GameRoom.database.store[id] = old;
      old = null;
    } else {
      delete GameRoom._cache[id];
      delete GameRoom.database.store[id];
    }
  });
}

function getRoom(id) {
  return GameRoom._cache[id] || { id };
}
