var _ = require('../helpers');
var MonopolyGame = require('./index');
var { createStore } = require('redux');
var undoable = require('redux-undo').default;
var monopolyReducer = require('./reducer');
var monopolyActions = require('./actions');

class MonopolyRoom {

  constructor(game) {

    this._id = game._id;
    this.state = game;
    this.polls = {};
    this.players = {};

    this.store = createStore(undoable(monopolyReducer),
      { past: [], present: this.state, future: [] });

    this.store.subscribe(() => {
      this.state = this.store.getState();
    });
  }

  join(socket, player) {
    let pid = _.dasherize(player.name);

    if (this.players[pid]) {
      socket.emit('message', 'error', `${player.name} is already playing`);
      return;
    }

    if (this.state.players.find((p) => p._id === pid)) {
      this.setupSocket(pid, socket);
      return;
    }

    if (!this.players._length) {
      return;
    }

    socket.emit('message', 'pending', 'Waiting on the concensus');

    this.newPoll('join', `${player.name} would like to join the game`, (result) => {
      if (result) {
        store.dispatch(monopolyActions.joinGame(player));
        this.setupSocket(pid, socket);
      }
    });
  }

  setupSocket(pid, socket) {

    this.players[pid] = socket;
    this.players._length += 1;

    socket.join(this._id);
    socket.emit('joined game', this.state);

    // @TODO: other events

    socket.on('vote', (poll, tally) => {
      this.polls[poll][pid] = tally;

      if (this.checkPoll(poll)) {
        this.closePoll(poll);
      }
    });

    socket.on('disconnect', () => {
      delete this.players[pid];
      this.players._length -= 1;

      if (this.players._length === 0 && this.teardown) {
        this.teardown();
      }
    });
  }

  // @TODO: Timed polls
  newPoll(name, message, callback) {
    this.polls[name] = {
      _majority: Math.floor(this.players._length / 2) + 1,
      _callback: callback
    };

    this.emit('poll', name, message);
  }

  checkPoll(name) {
    let poll = this.polls[name];
    let votes = Object.keys(this.players).map((pid) => poll[pid]);

    let yes = votes.filter((v) => v === true).length;

    poll._result = yes >= poll._majority;
    return poll._result;
  }

  closePoll(name) {
    let poll = this.polls[name];

    if (poll._callback) {
      poll._callback(poll._result);
    }

    this.emit('end poll', name, poll._result);

    delete this.polls[name];
  }

  emit() {
    this.io.to(this._id).emit(...arguments);
  }
}

module.exports = function(db) {
  let games = db.collection('games');
  let rooms = {};

  function join(gameID, socket, data) {
    games.findOne({ _id: gameID }, (err, game) => {
      if (err || !game) {
        socket.emit('message', 'error', err ? err.message : 'Game not found');
        return;
      }

      let room = rooms[gameID];

      if (!room) {
        room = new MonopolyRoom(game);
        room.teardown = () => delete rooms[gameID];
        rooms[gameID] = room;
      }

      room.join(socket, data);
    });
  }

  return { join };
};
