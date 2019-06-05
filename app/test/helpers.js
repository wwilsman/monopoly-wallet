import React from 'react';
import expect from 'expect';
import { mount } from 'testing-hooks/react-dom';
import { createTestingHook } from 'testing-hooks';

import { createGameState, transformGameState } from 'server/test/helpers';
import GameRoom from 'server/src/room';
import connectSocket from 'server/src/socket';

import CONFIG_FIXTURE from 'server/themes/classic/config.yml';
import PROPERTY_FIXTURES from 'server/themes/classic/properties.yml';
import MESSAGES_FIXTURE from 'server/themes/classic/messages.yml';

import WebSocket from './mock-websocket';
import AppInteractor from './interactors/app';
import AppRoot from '../src/root';

const {
  defineProperty,
  getOwnPropertyDescriptor
} = Object;

GameRoom.set('loader', (theme, name) => {
  switch (name) {
    case 'config': return CONFIG_FIXTURE;
    case 'properties': return PROPERTY_FIXTURES;
    case 'messages': return MESSAGES_FIXTURE;
  }
});

const mockWebsockets = createTestingHook(() => {
  let og = window.WebSocket;
  window.WebSocket = WebSocket;

  let io = new WebSocket.Server(`ws://${window.location.host}`);
  io.on('connection', connectSocket);

  return () => {
    window.WebSocket = og;
    io.close();
  };
});

const mockLocalStorage = createTestingHook(() => {
  let og = getOwnPropertyDescriptor(window, 'localStorage');

  defineProperty(window, 'localStorage', {
    value: {
      data: {},
      setItem(key, string) {
        this.data[key] = JSON.parse(string);
      },
      getItem(key) {
        return JSON.stringify(this.data[key]);
      },
      clear() {
        this.data = {};
      }
    }
  });

  return () => {
    window.localStorage.clear();
    defineProperty(window, 'localStorage', og);
  };
});

export const mockGame = createTestingHook(({
  id = 't35tt',
  state: transforms = {},
  config: conf = {},
  clear
} = {}) => {
  let config = { ...CONFIG_FIXTURE, ...conf };
  let state = createGameState(PROPERTY_FIXTURES, config);
  state = transformGameState(state, transforms, config);

  let game = { id, config, theme: 'classic', game: state };
  GameRoom.database.store[id] = game;

  if (!GameRoom._cache[id] || clear) {
    GameRoom._cache[id] = new GameRoom(game);
    AppInteractor.define('room', () => GameRoom._cache[id]);
  } else {
    GameRoom._cache[id].refresh();
  }
});

export function setupApplication(hook = () => {}) {
  beforeEach(async () => {
    await mockWebsockets();
    await mockLocalStorage();
    await mockGame({ clear: true });

    // mount our app
    let ref = React.createRef();
    await mount(<AppRoot ref={ref} test />);
    AppInteractor.define('app', () => ref.current);

    // wait until ready
    await new AppInteractor().assert.state(({ app }) => {
      expect(app.waiting).not.toContain('connected');
    });

    await hook();
  });
}
