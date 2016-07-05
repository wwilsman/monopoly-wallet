var _ = require('../helpers');
var MonopolyGame = require('./index');
var { createStore } = require('redux');
var undoable = require('redux-undo').default;
var monopolyReducer = require('./reducer');
var monopolyActions = require('./actions');
var io, games;

// @TODO: Flesh out game room events

function join(socket, gameID, player) {
  games.findOne({ _id: gameID }, function(err, game) {

    // Error/Not Found
    if (err || !game) {
      socket.emit('message', 'error', err ? err.message : 'Game not found');
      return;
    }

    // Get existing data
    let { store, polls } = getRoomData(gameID);

    // First player here
    if (!store) {

      // Setup store
      store = createStore(undoable(monopolyReducer),
        { past: [], present: game, future: [] });

      // Track polls
      polls = {};

      // Save data
      setRoomData(gameID, { store, polls });

      // Join room
      socket.join(gameID);
      socket.emit('joined', store.getState());

      // Setup socket
      setup(socket, gameID);
    } else {

      // Let the player know we're waiting on others
      socket.emit('message', 'pending', 'Waiting on the concensus');

      // Ask to join
      createPoll(gameID, {
        name: 'join request',
        message: `${player.name} would like to join the game`,
      }, (result) => {
        if (result) {

          // Join game
          store.dispatch(monopolyActions.joinGame(player));

          // Join room
          socket.join(gameID);
          socket.emit('joined', store.getState());

          // Setup socket
          setup(socket, gameID);
        }
      }, socket);
    }
  });
}

function setup(socket, gameID) {
  let { store, polls } = getRoomData(gameID);

  // Setup listeners
  socket.on('vote', function(pole, vote) {
    polls[pole][socket.id] = vote;

    if (checkPoll(gameID, pole)) {
      closePoll(gameID, pole, true);
    }
  });
}

// @TODO: Set a time limit
function createPoll(gameID, poll, callback, socket) {
  let { polls } = getRoomData(gameID);
  let results = socket ? { [socket.id]: true } : {};

  polls[poll.name] = { callback, results };

  setRoomData(gameID, { polls });

  (socket || io).to(gameID).emit('poll', poll, message);
}

function checkPoll(gameID, poll) {
  let { polls } = getRoomData(gameID);
  let n = io.adapter.rooms[data].sockets.length;
  let r = polls[poll].results;
  let votes = Object.keys(r);

  return votes.length === n &&
    Math.floor(n / 2) + 1 <= votes.reduce((t, id) => {
      return t + r[id] ? 1 : 0;
    }, 0);
}

function closePoll(gameID, poll, result) {
  let { polls } = getRoomData(gameID);

  if (poll.callback) {
    poll.callback.call(result);
  }

  delete polls[poll];

  io.to(gameID).emit('poll end', poll, result);
}

function getRoomData(room) {
  return io.adapter.rooms[room].data || {};
}

function setRoomData(room, data) {
  data = _.extend(getRoomData(io, room), data);
  return io.adapter.rooms[room].data = data;
}

module.exports = function(socketIO, db) {
  games = db.collection('games');
  io = socketIO;

  return { join };
};
