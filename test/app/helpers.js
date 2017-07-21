/* global before, beforeEach, afterEach  */
import React from 'react';
import { mount } from 'enzyme';
import ioServer from 'mock-socket/server';

import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';

import {
  createGameState,
  transformGameState
} from '../helpers';
import GameRoom from '../../server/room';
import MonopolyError from '../../server/error';
import AppRoot from '../../app/root';

import CONFIG_FIXTURE from '../../server/themes/classic/config.yml';
import PROPERTY_FIXTURES from '../../server/themes/classic/properties.yml';
import MESSAGES_FIXTURE from '../../server/themes/classic/messages.yml';

// use chai enzyme matchers
chai.use(chaiEnzyme());

// always use fixtures for themes
GameRoom.load = (theme, name = theme) => {
  switch (name) {
    case 'config': return CONFIG_FIXTURE;
    case 'properties': return PROPERTY_FIXTURES;
    case 'messages': return MESSAGES_FIXTURE;
  }
};

// used to store the current running test's context
let testContext = null;

/**
 * Starts a mock websocket server and mounts our app
 * @param {Object} [game={}] - Game state transforms
 * @param {Object} [config={}] - Custom game configuration
 * @param {Function} [beforeEach] - Before each callback
 * @param {Function} [afterEach] - After each callback
 */
export function setupAppForAcceptanceTesting({
  game, config,
  beforeEach:beforeEachCB,
  afterEach:afterEachCB
} = {}) {
  let rootElement, unsubscribeFromStore;

  mockGame({ state: game, config });

  beforeEach(async function() {
    // store our current testing context for other helpers
    testContext = this;

    // create the app root DOM node
    rootElement = document.createElement('div');
    rootElement.id = 'testing-root';
    document.body.appendChild(rootElement);

    // setup a mock websocket server
    this.io = new ioServer('/');
    this.io.on('connection', GameRoom.setup);

    // mount our app
    this.$ = mount(<AppRoot test/>, {
      attachTo: rootElement
    });

    // useful things to assert against
    this.app = this.$.instance();
    this.state = this.app.store.getState();
    this.location = this.state.router.location;

    // keep local contexts up to date with the app
    unsubscribeFromStore = this.app.store.subscribe(() => {
      this.state = this.app.store.getState();
      this.location = this.state.router.location;
    });

    // wait until the app is has loaded before continuing
    await waitUntil(() => (
      !this.state.app.loading
    ));

    // convinience hook
    if (beforeEachCB) {
      await beforeEachCB.call(this);
    }
  });

  afterEach(async function() {
    // convinience hook
    if (afterEachCB) {
      await afterEachCB.call(this);
    }

    // wait until all cleanup has finished
    await new Promise((resolve) => {
      unsubscribeFromStore();
      this.$.detach();

      document.body.removeChild(rootElement);

      unsubscribeFromStore = null;
      rootElement = null;
      testContext = null;

      this.io.stop(resolve);
    });
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
    old = GameRoom.db.store[id];
    GameRoom.db.store[id] = { id, state, config };
    this.room = id;
  });

  afterEach(function() {
    if (old) {
      GameRoom.db.store[id] = old;
      old = null;
    } else {
      delete GameRoom.db.store[id];
    }
  });
}

/**
 * Uses the app's history object to go to the specified location
 * @param {String|Object} location - URL or location object
 * @returns {Promise} A promise that resolves after the next tick
 */
export function visit(location) {
  if (testContext) {
    testContext.app.history.push(location);
  }

  return nextTick();
}

/**
 * Clicks the rendered DOM element using the native method
 * @param {Object} wrapper - Enzyme wrapper instance
 * @returns {Promise} A promise that resolves after the next tick
 */
export function click(wrapper) {
  wrapper.getDOMNode().click();
  return nextTick();
}

/**
 * Set's the value of the rendered DOM element and triggers a native change event
 * @param {Object} wrapper - Enzyme wrapper instance
 * @param {String} value - String to set the value as
 * @returns {Promise} A promise that resolves after the next tick
 */
export function fill(wrapper, value) {
  const node = wrapper.getDOMNode();

  node.value = value;
  node.dispatchEvent(new Event('change'));

  return nextTick();
}

/**
 * Creates a loop that resolves after `fn` returns true or rejects after a timeout
 * @param {Function} fn - Function that returns true to resolve the promise
 * @returns {Promise} Resolves when `fn` is true or rejects after a timeout
 */
export function waitUntil(fn) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const loop = () => {
      const ellapsed = Date.now() - start;
      const result = fn.call(testContext);

      if (result || ellapsed >= 2000) {
        if (ellapsed >= 2000) {
          reject(new Error('Timeout exceeded'));
        } else resolve();
      } else requestAnimationFrame(loop);
    };

    loop();
  });
}

/**
 * Return a promise that resolves after the next rendering tick
 * @returns {Promise}
 */
function nextTick() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0);
    });
  });
}
