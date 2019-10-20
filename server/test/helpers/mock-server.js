import { createTestingHook } from 'testing-hooks';
import { createPlayerEmitter } from 'app/src/helpers/emitter';
import { create } from '../../src/state';
import GameRoom from '../../src';

// set up a mock game in the game room manager
export async function mockGame({
  room,
  theme,
  config = {},
  players = [],
  properties = [],
  notice = null,
  history = [],
  bank,
  houses,
  hotels
} = {}) {
  let state;

  // load an existing game
  if (room && !theme) {
    state = await this.loadGame(room)
      .then(s => ({ ...s, config: { ...s.config, ...config } }))
      .catch(() => {});
  }

  // create a brand new new state
  if (!state) {
    theme = theme || 'classic';

    state = create({
      room, theme, notice, history,
      config: { ...this.loadTheme(theme, 'config'), ...config },
      properties: this.loadTheme(theme, 'properties')
    });
  }

  // make any transforms defined by mock options
  state = await this.saveGame({
    ...state,
    bank: bank ?? state.bank,
    houses: houses ?? state.houses,
    hotels: hotels ?? state.hotels,
    notice: notice ?? state.notice,
    history: history ?? state.history,
    timestamp: Date.now(),

    // automatically create players with a starting balance and name
    players: players.reduce((players, transform) => ({
      ...players,

      all: !players.all.includes(transform.token)
        ? players.all.concat(transform.token)
        : players.all,

      [transform.token]: {
        ...(players[transform.token] || {
          name: `PLAYER ${players.all.length + 1}`,
          balance: state.config.playerStart,
          bankrupt: false
        }),
        ...transform
      }
    }), state.players),

    properties: properties.reduce((properties, transform) => {
      if (transform.group) {
        // transform a group of properties
        return properties.all.reduce((properties, id) => ({
          ...properties,

          [id]: properties[id].group === transform.group
            ? { ...properties[id], ...transform }
            : properties[id]
        }), properties);
      } else if (transform.id) {
        // transform a single property
        return {
          ...properties,

          [transform.id]: {
            ...properties[transform.id],
            ...transform
          }
        };
      } else {
        return properties;
      }
    }, state.properties)
  });

  // update existing players
  if (this.rooms.has(room)) {
    let instance = this.rooms.get(room);
    instance.broadcast('game:update', state);
    instance.broadcast('room:sync', {
      timestamp: state.timestamp,
      players: state.players,
      active: instance.active
    });
  }

  return state;
}

// create a websocket that emits events to the returned emitter
async function createTestSocket(socket, initevents = []) {
  let emitter = createPlayerEmitter(socket);
  emitter.timeout(100);

  let send = emitter.send;
  emitter.send = (...args) => {
    return send(...args).catch(({ message }) => {
      throw new Error(message);
    });
  };

  emitter.expect = event => {
    return new Promise((resolve, reject) => {
      let _timeout = setTimeout(() => {
        reject(new Error(`"${event}" no response after ${emitter.timeout()}ms`));
        emitter.off(event, handle);
      }, emitter.timeout());

      let handle = (...args) => {
        emitter.off(event, handle);
        clearTimeout(_timeout);
        resolve(args);
      };

      emitter.on(event, handle);
    });
  };

  await initevents.reduce((promise, [event, ...args]) => (
    promise.then(() => emitter.send(event, ...args))
  ), emitter.expect('connected'));

  return emitter;
}


// set up the game room manager for testing
export default createTestingHook((ctx, { wss, ws, fixtures }) => {
  wss = wss();

  ctx.socket = init => createTestSocket(ws(), init);
  ctx.grm = new GameRoom.Manager({ wss }).use({
    loadTheme: (name, path) => fixtures[name][path],
    mockGame
  });

  return () => {
    delete ctx.socket;
    delete ctx.grm;
    wss.close();
  };
});
