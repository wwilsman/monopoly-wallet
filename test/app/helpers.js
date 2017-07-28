/* global describe, beforeEach, afterEach, it  */
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
  createGameState,
  transformGameState
} from '../helpers';
import GameRoom from '../../server/room';
import MonopolyError from '../../server/error';
import AppRoot from '../../app/root';

import CONFIG_FIXTURE from '../../server/themes/classic/config.yml';
import PROPERTY_FIXTURES from '../../server/themes/classic/properties.yml';
import MESSAGES_FIXTURE from '../../server/themes/classic/messages.yml';

// use chai jquery matchers
chai.use((chai, utils) => chaiJQuery(chai, utils, $));

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

// handy exports
export {
  describe,
  beforeEach,
  afterEach
};

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
    beforeEach(async function() {
      testContext = this;

      // create the app root DOM node
      rootElement = document.createElement('div');
      rootElement.id = 'testing-root';
      document.body.appendChild(rootElement);

      // setup a mock websocket server
      this.io = new ioServer('/');
      this.io.on('connection', GameRoom.setup);

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
      this.visit = (...args) => this.app.history.push(...args);

      // wait until the app has loaded before continuing
      await waitUntil(() => !this.state.app.loading);
    });

    afterEach(async function() {
      // wait until all cleanup has finished
      await new Promise((resolve) => {
        unsubscribeFromStore();
        unsubscribeFromStore = null;

        unmountComponentAtNode(rootElement);
        document.body.removeChild(rootElement);
        rootElement = null;

        testContext = null;

        this.io.stop(resolve);
      });
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
 * Loops over an assertion that `fn` returns true and resolves once it passes
 * @param {Function} fn - Function that returns true to resolve the promise
 * @returns {Promise} Resolves when `fn` is true or rejects after a timeout
 */
export function waitUntil(fn) {
  return loopedAssert(() => {
    chai.expect(fn()).to.be.true;
  }).call(testContext);
}

/**
 * This turns every call of `it` into a "convergent assertion." The
 * assertion is run every 10ms until it is either true, or it times
 * out. This makes it incredibly robust in the face of asynchronous
 * operations which could happen instantly, or they could happen after
 * 1.5 seconds. The assertion doesn't care unless until it's reflected
 * in the UI.
 *
 * The only caveat is that all assertions should be "pure" that is to
 * say, completely without side-effects.
 *
 * good:
 *   it('has some state', function() {
 *     expect(thing).to.be('awesome');
 *   });
 *
 * bad:
 *   it('twiddles when clicked', function() {
 *     click('.a-button');
 *     expect(thing).to.be('set');
 *   });
 *
 * @param {String} name - Name of the test
 * @param {Function} [assertion] - The function to assert
 */
const ogIt = window.it;
it.immediately = ogIt;
it.skip = ogIt.skip;
it.only = itOnly;
it.still = itStill;
export { it };

function it(name, assertion) {
  return !assertion ? ogIt(name) :
    ogIt(name, loopedAssert(assertion));
}

function itOnly(name, assertion) {
  return !assertion ? ogIt.only(name) :
    ogIt.only(name, loopedAssert(assertion));
}

function itStill(name, assertion, time) {
  return !assertion ? ogIt(name) :
    ogIt(name, loopedAssert(assertion, true, time));
}

function loopedAssert(assertion, invert, time) {
  return function() {
    const test = this;
    const start = Date.now();
    const timeout = time || test.timeout();
    const interval = 10;

    return new Promise((resolve, reject) => {
      (function loop() {
        const ellapsed = Date.now() - start;
        const doLoop = ellapsed + interval < timeout;

        try {
          const ret = assertion.call(test);

          if (invert && doLoop) {
            window.setTimeout(loop, interval);
          } else if (ret && typeof ret.then === 'function') {
            ret.then(resolve);
          } else {
            resolve();
          }
        } catch(error) {
          if (!invert && doLoop) {
            window.setTimeout(loop, interval);
          } else if (invert || !doLoop) {
            reject(error);
          }
        }
      })();
    });
  };
}
