import GameRoom from './room';

/**
 * Sets up a socket for interacting with a game room
 * @param {Socket} socket - Socket.io socket instance
 */
export default (socket) => {

  /**
   * Emits a room error
   * @param {Error} error - Error instance
   */
  const emitError = (error) => {
    socket.emit('room:error', {
      name: error.name,
      message: error.message
    });
  };

  /**
   * Creates a new game and emits it's initial state
   * @param {Object} config - Custom game configuration
   */
  socket.on('game:new', (config) => {
    GameRoom.new(config).then((game) => {
      socket.emit('game:created', game);
    }).catch(emitError);
  });

  /**
   * Connects to a game room and emits it's state
   * @param {String} gameID - Game room ID
   */
  socket.on('room:connect', (gameID) => {
    GameRoom.connect(socket, gameID).then((room) => {
      socket.emit('room:connected', room.state);

      socket.on('poll:vote', (pollID, vote) => {
        room.vote(socket, pollID, vote);
      });
    }).catch(emitError);
  });
};
