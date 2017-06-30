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

      /**
       * Joins or asks to join the current game
       * @param {String} name - Player name
       * @param {String} token - Player token
       */
      socket.on('game:join', (name, token) => {
        if (room.players.has(socket)) {
          emitError(room.error('player.playing'));
          return;
        }

        if (!room.players.size || room.game.players[token]) {
          room.join(socket, name, token)
            .then(() => socket.emit('game:joined', room.state))
            .catch(emitError);

        } else {
          room.poll(room.notice('player.ask-to-join', { player: { name }}))
            .then((result) => {
              if (!result) throw room.error('player.denied');
              return room.join(socket, name, token);
            })
            .then(() => socket.emit('game:joined', room.state))
            .catch(emitError);
        }
      });

      /**
       * Places a vote in an ongoing poll
       * @param {String} pollID - Poll ID
       * @param {Boolean} vote - Whether to vote yes or no
       */
      socket.on('poll:vote', (pollID, vote) => {
        room.vote(socket, pollID, vote);
      });

      /**
       * Wrap game actions to pass the socket as the first argument
       * and emit any errors as game errors
       */
      const gameActions = [
        ['player:transfer', room.makeTransfer],
        ['player:claim-bankruptcy', room.claimBankruptcy],

        ['property:buy', room.buyProperty],
        ['property:improve', room.improveProperty],
        ['property:unimprove', room.unimproveProperty],
        ['property:mortgage', room.mortgageProperty],
        ['property:unmortgage', room.unmortgageProperty],
        ['property:pay-rent', room.payRent],

        ['auction:new', room.auctionProperty],
        ['auction:bid', room.placeBid],
        ['auction:concede', room.concedeAuction],

        ['trade:new', room.makeOffer],
        ['trade:decline', room.declineOffer],
        ['trade:accept', room.acceptOffer]
      ];

      gameActions.forEach(([eventName, promised]) => {
        socket.on(eventName, (...args) => {
          promised(socket, ...args).catch((error) => {
            socket.emit('game:error', error);
          });
        });
      });
    }).catch(emitError);
  });
};
