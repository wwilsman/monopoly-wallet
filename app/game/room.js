var _ = require('../helpers');
var MonopolyGame = require('./index');
var { createStore } = require('redux');
var undoable = require('redux-undo').default;
var monopolyReducer = require('./reducer');
var monopolyActions = require('./actions');

class MonopolyRoom {

  constructor(game, socket) {

    this._id = game._id;

    this.state = game;

    this.store = createStore(undoable(monopolyReducer),
      { past: [], present: this.state, future: [] });

    this.store.subscribe(() => {
      this.state = this.store.getState();
    });

    this.polls = {};

    this.sockets = [];
    this.setupSocket(socket);
  }

  join(socket, { name = '', token = '' }) {

    socket.emit('message', 'pending', 'Waiting on the concensus');

    this.newPoll('join', `${name} would like to join the game`, (result) => {
      if (result) {

        store.dispatch(monopolyActions.joinGame(player));

        this.setupSocket(socket);
      }
    });
  }

  setupSocket(socket) {
    this.sockets.push(socket);

    socket.join(this._id);
    socket.emit('joined', this.state);

    // @TODO: other events

    socket.on('vote', (poll, tally) => {
      this.polls[poll][socket.id] = tally;

      if (this.checkPoll(poll)) {
        this.closePoll(poll);
      }
    });

    socket.on('disconnect', () => {
      this.sockets.splice(this.sockets.indexOf(socket), 1);

      if (this.sockets.length === 0 && this.teardown) {
        this.teardown();
      }
    });
  }

  // @TODO: Timed polls
  newPoll(name, message, callback) {
    this.polls[name] = {
      major: Math.floor(this.sockets.length / 2) + 1,
      votes: {},
      callback
    };

    this.emit('poll', name, message);
  }

  checkPoll(name) {
    let poll = this.polls[name];

    poll.result = this.sockets.reduce((t, s) => {
      return t + (poll.votes[s.id] ? 1 : 0);
    }, 0);

    return poll.result >= poll.major;
  }

  closePoll(name) {
    let poll = this.polls[name];

    if (poll.callback) {
      poll.callback(poll.result);
    }

    this.emit('end poll', name, poll.result);

    delete this.polls[name];
  }

  emit() {
    this.io.to(this._id).emit(...arguments);
  }
}

module.exports = function(db) {
  let games = db.collection('games');
  let rooms = {};

  function create(gameID, socket) {
    if (!rooms[gameID]) {
      games.findOne({ _id: gameID }, (err, game) => {
        if (err || !game) {
          socket.emit('message', 'error', err ? err.message : 'Game not found');
          return;
        }

        let room = new MonopolyRoom(game, socket);
        room.teardown = () => delete rooms[gameID];
        rooms[gameID] = room;
      });
    }
  }

  function join(gameID, socket, data) {
    games.findOne({ _id: gameID }, (err, game) => {
      if (err || !game) {
        socket.emit('message', 'error', err ? err.message : 'Game not found');
        return;
      }

      let room = rooms[gameID];

      if (room) {
        room.join(socket, data);
      }
    });
  }

  return { create, join };
};
