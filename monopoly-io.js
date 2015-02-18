var MonopolyGame = require('./lib/main');

module.exports = function(io) {

  // Game-Socket relationship
  function GameSocket(game_id, socket) {
    //var config = db.findById(game_id);
    var ctx = this;

    // loop through methods and bind events
    for (var method_name in this) {
      if (typeof this[method_name] === 'function') {
        socket.on(method_name, this[method_name].bind(this));
      }
    }

    // join room
    socket.join(game_id);

    // set properties
    this.socket = socket;
    this.game = new MonopolyGame(/*config*/);
  }


  GameSocket.init = function(game_id, socket) {
    return new GameSocket(game_id, socket);
  };


  // Methods act as io events
  GameSocket.prototype = {

  };


  return GameSocket;
};
