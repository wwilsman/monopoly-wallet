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
 * Starts a mock websocket server, mocks data, and mounts our app
 * @param {Object} [game={}] - Game state transforms
 * @param {Object} [config={}] - Custom game configuration
 * @param {Function} [beforeEach] - Before each callback
 * @param {Function} [afterEach] - After each callback
 */
export function setupAppForAcceptanceTesting({
  game = {},
  config = {},
  beforeEach:beforeEachCB,
  afterEach:afterEachCB
} = {}) {
  let rootElement, unsubscribeFromStore;

  before(function() {
    this.room = 't35tt';
    this.rootElement = null;
    this.config = { ...CONFIG_FIXTURE, ...config };
    this.game = createGameState(PROPERTY_FIXTURES, this.config);
    this.game = transformGameState(this.game, game, this.config);
  });

  beforeEach(async function() {
    testContext = this;

    GameRoom.db.store[this.room] = {
      id: this.room,
      state: this.game,
      config: this.config
    };

    this.io = new ioServer('/');
    this.io.on('connection', GameRoom.setup);

    rootElement = document.createElement('div');
    rootElement.id = 'testing-root';

    document.body.appendChild(rootElement);

    this.$ = mount(<AppRoot test/>, {
      attachTo: rootElement
    });

    this.app = this.$.instance();
    this.state = this.app.store.getState();
    this.location = this.state.router.location;

    unsubscribeFromStore = this.app.store.subscribe(() => {
      this.state = this.app.store.getState();
      this.location = this.state.router.location;
    });

    if (beforeEachCB) {
      await beforeEachCB.call(this);
    }

    await waitUntil(() => (
      !this.state.app.loading
    ));
  });

  afterEach(async function() {
    if (afterEachCB) {
      await afterEachCB.call(this);
    }

    await new Promise((resolve) => {
      unsubscribeFromStore();
      unsubscribeFromStore = null;

      this.$.detach();
      document.body.removeChild(rootElement);
      rootElement = null;

      delete GameRoom.db.store[this.room];
      testContext = null;

      this.io.stop(resolve);
    });
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
 * @param {Object} [wrapper] - Enzyme wrapper instance
 * @param {String} selector - Enzyme selector to click
 * @returns {Promise} A promise that resolves after the next tick
 */
export function click(wrapper, selector = wrapper) {
  let node;

  if (typeof selector === 'string') {
    if (wrapper === selector) wrapper = testContext.$;
    node = wrapper.find(selector).getDOMNode();
  } else {
    node = wrapper.getDOMNode();
  }

  node.click();

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

      if (ellapsed < 2000 && !result) {
        requestAnimationFrame(loop);
      } else {
        if (ellapsed >= 2000) {
          reject(new Error('Timeout exceeded'));
        } else resolve();
      }
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
