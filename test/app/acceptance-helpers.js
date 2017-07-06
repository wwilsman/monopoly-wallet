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
import App from '../../app/components/app';

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
  before(function() {
    this.room = 't35tt';
    this.rootElement = null;
    this.config = { ...CONFIG_FIXTURE, ...config };
    this.game = createGameState(PROPERTY_FIXTURES, this.config);
    this.game = transformGameState(this.game, game, this.config);
  });

  beforeEach(async function() {
    this.rootElement = document.createElement('div');
    this.rootElement.id = 'testing-root';

    document.body.appendChild(this.rootElement);

    this.io = new ioServer('/');
    this.io.on('connection', GameRoom.setup);

    GameRoom.db.store[this.room] = {
      id: this.room,
      state: this.game,
      config: this.config
    };

    this.app = mount(<App/>, {
      context: { test: true },
      attachTo: this.rootElement
    });

    if (beforeEachCB) {
      await beforeEachCB.call(this);
    }
  });

  afterEach(async function(done) {
    if (afterEachCB) {
      await afterEachCB.call(this);
    }

    this.app && this.app.detach();
    document.body.removeChild(this.rootElement);

    delete GameRoom.db.store[this.room];
    this.io.stop(done);
  });
}
