import { randomString } from './helpers';
import { create } from './state';
import { error } from './error';
import Player from './player';
import GameRoom from './room';

const { assign } = Object;

// the game room manager uses websockets to connect players through rooms and is
// responsible for creating, saving, and loading games for those rooms
export default class Manager {
  // the websocket server is the only option, but is required
  constructor({ wss }) {
    // used to track rooms
    this.rooms = new Map();

    // used to track players connected to rooms
    this.players = new Map();

    // for retrospection
    this.wss = wss;

    // create players from new sockets
    wss.on('connection', ws => {
      let player = new Player(ws, this);

      // allow any player to create a new room
      player.on('room:create', async (options) => {
        let { room } = await this.create(options);
        return await this.connect(room, player);
      });

      // allow any player to connect to an existing room
      player.on('room:connect', async (room) => {
        return await this.connect(room, player);
      });

      // let the player know the socket has connected
      player.send('connected');
    });
  }

  // override specific methods by assignment
  use({ loadTheme, loadGame, saveGame, mockGame } = {}) {
    if (loadTheme) assign(this, { loadTheme });
    // load and save need to be specified at the same time
    if (loadGame && saveGame) assign(this, { loadGame, saveGame });
    // defined in testing
    if (mockGame) assign(this, { mock: mockGame });
    // for chaining
    return this;
  }

  // should return config, properties, or messages for a specific theme
  async loadTheme(/* name, path */) {
    throw new Error('`#loadTheme` is not defined');
  }

  // should return a game's state or throw an error; defaults to ephemeral store
  async loadGame(room) {
    return this.__store?.[room]
      ? Promise.resolve(this.__store[room])
      : Promise.reject(new Error('Game not found'));
  }

  // should save and return a game's state; defaults to ephemeral store
  async saveGame(game) {
    this.__store = this.__store || Object.create(null);
    return Promise.resolve(this.__store[game.room] = game);
  }

  // creates, saves, and returns a new game state based on a theme
  async create({ theme = 'classic' } = {}) {
    const room = randomString().toLowerCase();

    try {
      // if this succeeds there is an existing game, try again
      await this.loadGame(room);
      await this.create({ theme });
    } catch (e) {
      // the real happy path, when the game does not exist
      let config = this.loadTheme(theme, 'config');
      let properties = this.loadTheme(theme, 'properties');
      let state = create({ room, theme, config, properties });
      return this.saveGame(state);
    }
  }

  // connects a player to a game room; if the room doesn't exist it is created
  async connect(room, player) {
    // player is already connected
    if (this.players.has(player)) {
      throw error('player.playing');
    }

    // load a game and get or create the room
    let game = await this.loadGame(room);
    let instance = this.rooms.get(room) ?? new GameRoom(game, this);

    // associate and connect the room and player
    this.rooms.set(room, instance);
    this.players.set(player, instance);
    instance.connect(player);

    // respond with minimal information about the room
    let { active } = instance;
    let { theme, config, players } = game;
    return { room, theme, config, active, players };
  }

  // disconnects a player from the manager and any connected room; cleans up
  // the connected room if empty, or syncs with remaining players
  async disconnect(player) {
    let room = player.room;

    if (room) {
      room.disconnect(player);
      this.players.delete(player);

      if (!room.players.size) {
        this.rooms.delete(room.id);
      } else {
        room.broadcast('room:sync', room.playing);
      }
    }
  }
}
