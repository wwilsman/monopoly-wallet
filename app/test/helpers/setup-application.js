import React from 'react';
import expect from 'expect';
import { act } from 'react-dom/test-utils';
import { mount } from 'testing-hooks/react-dom';
import { createMemoryHistory } from 'history';

import mockSocket from './mock-socket';
import mockLocalStorage from './mock-storage';
import mockServer from 'server/test/helpers/mock-server';

import AppInteractor from '../interactors/app';
import AppRoot from '../../src/root';

// fixtures
import CONFIG_FIXTURE from 'server/themes/classic/config.yml';
import PROPERTY_FIXTURES from 'server/themes/classic/properties.yml';
import MESSAGES_FIXTURE from 'server/themes/classic/messages.yml';

function createAppContext() {
  let ctx = {
    state: null,
    setState: s => void(ctx.state = s),
    history: createMemoryHistory()
  };

  return ctx;
}

export default function setupApplication(callback = () => {}) {
  beforeEach(async function () {
    let ctx = createAppContext();
    AppInteractor.defineContext(() => ctx);

    await mockSocket();
    await mockLocalStorage(this);
    await mockServer(this, {
      wss: () => new WebSocket.Server(`ws://${window.location.host}`),
      ws: () => new WebSocket(`ws://${window.location.host}`),

      fixtures: {
        classic: {
          config: CONFIG_FIXTURE,
          properties: PROPERTY_FIXTURES,
          messages: MESSAGES_FIXTURE
        }
      }
    });

    await act(async () => {
      await mount(
        <AppRoot
          history={ctx.history}
          onGameUpdate={ctx.setState}
        />
      );
    });

    await new AppInteractor()
      .assert.state(state => {
        expect(state).toHaveProperty('connected', true);
      });

    await callback.call(this);
  });
}
