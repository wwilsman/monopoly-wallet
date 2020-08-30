import YAML from 'yamljs';
import WebSocket from 'ws';
import mockServer from './mock-server';

// fixtures
const CONFIG_FIXTURE = YAML.load('./themes/classic/config.yml');
const PROPERTY_FIXTURES = YAML.load('./themes/classic/properties.yml');
const MESSAGES_FIXTURE = YAML.load('./themes/classic/messages.yml');

// set up the game room manager and websocket server for testing
export default function setupForTesting(callback = () => {}) {
  let cleanup;

  beforeEach(async function () {
    cleanup = await mockServer(this, {
      wss: () => new WebSocket.Server({ port: 8080 }),
      ws: () => new WebSocket('ws://localhost:8080'),

      fixtures: {
        classic: {
          config: CONFIG_FIXTURE,
          properties: PROPERTY_FIXTURES,
          messages: MESSAGES_FIXTURE,
        }
      }
    });

    await callback.call(this);
  });

  afterEach(async () => {
    await cleanup();
  });
}
