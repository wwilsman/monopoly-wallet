import { reducers } from './state';
import { get, meta, randomString } from './helpers';
import { error } from './error';

import Poll from './poll';

const { from: toArray } = Array;

// used by the message formatter
const FORMATTER = /{{([\w.]+?)}}/g;

// creates a message formatter bound to a specific set of messages
function createFormatter(messages) {
  return (id, data) => {
    let msg = get(id, messages);

    if (msg && data) {
      // replace "{{path.to.thing}}" with values from `data`
      return msg.replace(FORMATTER, (_, k) => get(k, data));
    } else {
      // no data, return message; no message, return id
      return msg || id;
    }
  };
}

// the game room brokers player events with state updates, player-to-player
// interactions, and keeps players updated with the latest state
export default class GameRoom {
  // the room is pass the entire game, but only stores the id and uses the theme
  // to load theme-specific messages for formatting notices and errors
  constructor({ room, theme }, manager) {
    this.id = room;
    this.manager = manager;

    // used to track connected players
    this.players = new Map();

    // used to track polls
    this.polls = Object.create(null);

    // used to format notices and errors
    this.format = createFormatter(
      manager.loadTheme(theme, 'messages')
    );
  }

  // connects a player to the room; when connected with a token, allows the
  // player to interact with the game
  connect(player, token) {
    // new player, no token and not connected
    if (!token && !this.players.has(player)) {
      this.players.set(player, '');

      // allow new players to join the game
      player.on('game:join', (name, token) => (
        this.join(player, name, token)
      ));

      // new token, previously connected without
    } else if (token && !this.players.get(player)) {
      this.players.set(player, token);

      // allow players to vote in polls
      player.on('poll:vote', (pid, vote) => {
        this.polls[pid]?.vote(player, vote);
        return pid;
      });

      // allow players to communicate with other players
      player.on('message:send', (to, message) => (
        this.message(token, to, message)
      ));

      // allow players to interact with the game state
      [ ['player:transfer', reducers.player.transfer],
        ['player:bankrupt', reducers.player.bankrupt],
        ['property:buy', reducers.property.buy],
        ['property:transfer', reducers.property.transfer],
        ['property:improve', reducers.property.improve],
        ['property:unimprove', reducers.property.unimprove],
        ['property:mortgage', reducers.property.mortgage],
        ['property:unmortgage', reducers.property.unmortgage],
        ['property:rent', reducers.property.rent]
      ].forEach(([event, reducer]) => {
        player.on(event, async (...args) => {
          let state = await this.update(true, reducer(token, ...args));
          player.broadcast('game:update', state);
          return state;
        });
      });
    }
  }

  // removes a player from the room
  disconnect(player) {
    this.players.delete(player);
  }

  // returns the tokens of players that have joined the game
  get active() {
    return toArray(this.players.values()).filter(Boolean);
  }

  // loads this game from the manager
  async load() {
    return this.manager.loadGame(this.id);
  }

  // saves the game using the manager
  async save(state) {
    return this.manager.saveGame(state);
  }

  // generates a notice message and saves a game with the manager, when `state`
  // is `true`, the state will be automatically loaded
  async update(state, reduce) {
    if (state === true) {
      state = await this.load();
    }

    state = reduce(state);
    let { notice } = state;

    if (notice?.id && !notice?.message) {
      let message = this.format(`notice.${notice.id}`, meta(state, notice.meta));
      state = { ...state, notice: { ...state.notice, message } };
    }

    state = await this.save({ ...state, timestamp: Date.now() });
    return state;
  }

  // sends an event to all players that have joined the game; room events are
  // sent to all connected player; the `ignore` event option will skip sending
  // an event to the specified player
  broadcast(event, ...args) {
    let ignore = false;
    let isRoomEvent = false;

    if (typeof event !== 'string') ({ event, ignore } = event);
    isRoomEvent = event.split(':')[0] === 'room';

    this.players.forEach((token, player) => {
      if ((isRoomEvent || !!token) && (!ignore || player !== ignore)) {
        player.send(event, ...args);
      }
    });
  }

  // allows a player to join the game, or asks active players to let the player
  // join the game, then gives the player access to all room and game events
  async join(player, name, token) {
    let game = await this.load();
    let existing = game.players[token];
    let active = this.active;

    // player has joined or selected token is being used
    if (this.players.get(player) || active.includes(token)) {
      throw error('player.playing');
      // the token was selected by a previous player
    } else if (existing && existing.name !== name) {
      throw error('player.used-token');
    }

    // new player
    if (!existing) {
      // poll other players to join
      if (active.length) {
        let result = await this.poll('player.ask-to-join', { player: { name } });
        if (!result) throw error('player.denied');
      }

      game = await this.update(game, reducers.player.join(name, token));
      player.broadcast('game:update', game);
    }

    // player is considered joined when there is an associated token
    this.connect(player, token);
    active = active.concat(token);

    // update other players of the new players
    player.broadcast('room:sync', {
      timestamp: Date.now(),
      players: game.players,
      active
    });

    // return new active players with game and player info
    return { active, player: { name, token }, ...game };
  }

  // send a poll to all active players
  async poll(msg, data) {
    // the poll timeout needs to be loaded from the game config
    let { config: { pollTimeout } } = await this.load();
    // no need to check existing ids because multiple polls is uncommon
    let id = randomString();

    // store the poll for voting
    this.polls[id] = new Poll(this.players, pollTimeout);

    // tell all active players about the poll
    let message = this.format(`notice.${msg}`, data);
    this.broadcast('poll:new', id, message);

    // tell all active players about the poll results, the returned promise
    // resolves once all players have voted, or the timeout has elapsed
    let results = await this.polls[id].run();
    this.broadcast('poll:end', id, results);

    // remove the poll when done
    delete this.polls[id];
    return results;
  }

  // send a message from one player to another
  async message(from, to, message) {
    // find the connected player token pair
    let found = toArray(this.players.entries()).find(([,t]) => t === to);

    // not found, check if player has joined, or is just not connected
    if (!found) {
      let { players } = await this.load();

      if (!players[to]) {
        throw error('player.not-found', { player: { token: to } });
      } else {
        throw error('player.not-connected', { player: players[to] });
      }
    }

    // the other player receives a message event
    found[0].send('message:receive', from, message);
  }
}
