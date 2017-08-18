import React from 'react';
import {
  render,
  unmountComponentAtNode
} from 'react-dom';
import ioServer from 'mock-socket/server';

import chai from 'chai';
import chaiJQuery from 'chai-jquery';
import $ from 'jquery';

import {
  describe,
  beforeEach,
  afterEach,
  convergeOn
} from './test-helpers';
import {
  createGameState,
  transformGameState
} from '../helpers';

import GameRoom from '../../server/room';
import connectSocket from '../../server/socket';
import AppRoot from '../../app/root';

import CONFIG_FIXTURE from '../../server/themes/classic/config.yml';
import PROPERTY_FIXTURES from '../../server/themes/classic/properties.yml';
import MESSAGES_FIXTURE from '../../server/themes/classic/messages.yml';

// use chai jquery matchers
chai.use((chai, utils) => chaiJQuery(chai, utils, $));

// always use fixtures for themes
GameRoom.set('loader', (theme, name) => {
  switch (name) {
    case 'config': return CONFIG_FIXTURE;
    case 'properties': return PROPERTY_FIXTURES;
    case 'messages': return MESSAGES_FIXTURE;
  }
});

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
      this.io = new ioServer('/');
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

      // helper to change routes
      this.visit = (path, assertion) => {
        this.app.history.push(path);

        if (assertion) {
          return convergeOn(assertion);
        }
      };

      // wait until our app has finished loading
      return convergeOn(() => {
        chai.expect(this.state.app.loading).to.be.false;
      });
    });

    // teardown
    afterEach(function() {
      unsubscribeFromStore();
      unsubscribeFromStore = null;

      unmountComponentAtNode(rootElement);
      document.body.removeChild(rootElement);
      rootElement = null;

      this.io.stop();
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
    this.room = id;
    old = GameRoom.database.store[id];
    GameRoom.database.store[id] = {
      id, state, config,
      theme: 'classic'
    };
  });

  afterEach(function() {
    if (old) {
      GameRoom.database.store[id] = old;
      old = null;
    } else {
      delete GameRoom.database.store[id];
    }
  });
}
