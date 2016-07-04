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

    // Join room
    socket.join(gameID);

    // Get existing store
    let { store } = getRoomData(socket, gameID);

    // Setup store
    if (!store) {
      store = createStore(undoable(monopolyReducer),
        { past: [], present: game, future: [] });
      setRoomData(socket, gameID, { store });
    }

    // Join game
    store.dispatch(monopolyActions.joinGame(player));

    // Officially joined
    socket.emit('joined', store.getState());

    // Let the other players know
    io.in(gameID).emit('message', 'info', `${player.name} joined the game`);

    // Setup listeners
    //socket.on(event, listener)
  });
}

function getRoomData(socket, room) {
  return socket.adapter.rooms[room].data || {};
}

function setRoomData(socket, room, data) {
  data = _.extend(getRoomData(socket, room), data);
  return socket.adapter.rooms[room].data = data;
}

module.exports = function(socketIO, db) {
  games = db.collection('games');
  io = socketIO;

  return { join };
};
