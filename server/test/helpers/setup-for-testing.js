import YAML from 'yamljs';
import WebSocket from 'ws';

import GameRoom from '../../src';
import mockGame from './mock-game';
import createSocket from './create-socket';

// fixtures
const CONFIG_FIXTURE = YAML.load('./themes/classic/config.yml');
const PROPERTY_FIXTURES = YAML.load('./themes/classic/properties.yml');
const MESSAGES_FIXTURE = YAML.load('./themes/classic/messages.yml');

// always use fixtures for themes
function loadTheme(name, path) {
  switch (path) {
    case 'config': return CONFIG_FIXTURE;
    case 'properties': return PROPERTY_FIXTURES;
    case 'messages': return MESSAGES_FIXTURE;
  }
}

// set up the game room manager and websocket server for testing
export default function setupForTesting(callback) {
  beforeEach(async function () {
    let wss = new WebSocket.Server({ port: 8080 });
    let grm = new GameRoom.Manager({ wss });
    this.grm = grm.use({ loadTheme });
    this.grm.mock = mockGame.bind(this.grm);
    this.socket = createSocket;

    if (callback) {
      await callback.call(this);
    }
  });

  afterEach(function () {
    this.grm.wss.close();
  });
}
