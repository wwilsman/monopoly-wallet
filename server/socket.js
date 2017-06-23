import GameRoom from './room';

/**
 * Sets up a socket for interacting with a game room
 * @param {Socket} socket - Socket.io socket instance
 */
export default (socket) => {

  /**
   * Emits a room error
   * @param {String} message - Error message
   */
  const errorHandler = (message) => {
    socket.emit('room:error', message);
  };

  /**
   * Creates a new game and emits it's initial state
   * @param {Object} config - Custom game configuration
   */
  socket.on('game:new', (config) => {
    GameRoom.new(config).then((game) => {
      socket.emit('game:created', game);
    }).catch(errorHandler);
  });

  /**
   * Connects to a game room and emits it's state
   * @param {String} gameID - Game room ID
   */
  socket.on('room:connect', (gameID) => {
    GameRoom.connect(gameID).then((room) => {
      socket.emit('room:connected', {
        id: room.id,
        state: room.state,
        config: room.config
      });
    }).catch(errorHandler);
  });
};
