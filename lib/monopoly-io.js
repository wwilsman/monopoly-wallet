var MonopolyGame = require('./monopoly-game');

// Client-Game Communication
// =========================

module.exports = function(io) {

  // Game-Socket relationship
  function GameSocket(gameId, socket) {
    //var config = db.findById(gameId);
    var ctx = this;

    // loop through methods and bind events
    for (var methodName in this) {
      if (typeof this[methodName] === 'function') {
        socket.on(methodName, this[methodName].bind(this));
      }
    }

    // join room
    socket.join(gameId);

    // set properties
    this.socket = socket;
    this.game = new MonopolyGame(/*config*/);
  }


  // Static Methods
  // --------------

  // Creates new Game-Socket relationship
  GameSocket.init = function(gameId, socket) {
    return new GameSocket(gameId, socket);
  };


  // Event Methods
  // -------------

  GameSocket.prototype = {

  };


  return GameSocket;
};
