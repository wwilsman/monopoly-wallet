import GameRoom from './room';

/**
 * Sets up a socket for interacting with a game room
 * @param {Socket} socket - Socket.io socket instance
 */
export default function connectSocket(socket) {
  const emitError = socketError.bind(null, socket);

  // allow the socket to create a game
  socket.on('game:new', (config) => {
    GameRoom.new(config).then((game) => {
      socket.emit('game:created', game);
    }).catch(emitError);
  });

  // allow the socket to connect to an existing game
  socket.on('room:connect', (id) => {
    GameRoom.connect(id, socket).then((room) => {
      // on disconnect remove the socket from the room
      socket.on('disconnect', () => room.disconnect(socket));

      // keep the room state in sync
      room.on('sync', () => socket.emit('room:sync', room.state), socket);

      // allow the socket to join the game
      socket.on('game:join', (name, token) => {
        askRoomToJoin(room, socket, name, token)
          .then(() => connectPlayer(room, socket, token))
          .catch(emitError);
      });

      // tell the socket it's connected
      socket.emit('room:connected', room.state);
    }).catch(emitError);
  });
}

/**
 * Emits an error to the socket
 * @param {Socket} socket - Socket.io socket instance
 * @param {Error|Object} error - Error or Error-like object
 */
function socketError(socket, error) {
  const { name, message } = error;
  const type = name === 'MonopolyError' ? 'game' : 'room';
  socket.emit(`${type}:error`, { name, message });
}

/**
 * Joins or asks to join the current game
 * @param {GameRoom} room - GameRoom instance
 * @param {Socket} socket - Socket.io socket instance
 * @param {String} name - Player name
 * @param {String} token - Player token
 * @returns {Promise} Resolves when the player has joined, rejects when
 * the poll resolves to false
 */
function askRoomToJoin(room, socket, name, token) {
  if (Array.from(room.players.values()).includes(socket)) {
    return Promise.reject(room.error('player.playing'));

  } else if (!room.players.size || room.game.players[token]) {
    return room.join(name, token, socket).then(() => {
      socket.emit('game:joined', { room: room.id, token });
    });

  } else {
    const ask = room.notice('player.ask-to-join', { player: { name }});

    return room.poll(ask).then((result) => {
      if (!result) throw room.error('player.denied');

      return room.join(name, token, socket).then(() => {
        socket.emit('game:joined', { room: room.id, token });
      });
    });
  }
}

/**
 * Sets up player-only events
 * @param {GameRoom} room - GameRoom instance
 * @param {Socket} player - Socket.io socket instance
 * @param {String} token - The chosen player token
 */
function connectPlayer(room, player, token) {
  const emitError = socketError.bind(null, player);

  // tell our player about new polls
  room.on('poll', (poll) => player.emit('poll:new', poll), player);

  // allow the player vote in a poll
  player.on('poll:vote', (id, vote) => room.vote(token, id, vote));

  // allow the player to message others in the room by token
  player.on('message:send', (to, message) => {
    if (!room.players.has(to)) {
      emitError(room.error('player.not-found', {
        player: { token: to }
      }));
    } else {
      room.players.get(to).emit('message:received', {
        content: message,
        from: token
      });
    }
  });

  // wrap game actions to pass the token as the first argument
  // and emit any errors as game errors
  const gameActions = {
    'player:transfer': room.makeTransfer,
    'player:claim-bankruptcy': room.claimBankruptcy,

    'property:buy': room.buyProperty,
    'property:improve': room.improveProperty,
    'property:unimprove': room.unimproveProperty,
    'property:mortgage': room.mortgageProperty,
    'property:unmortgage': room.unmortgageProperty,
    'property:pay-rent': room.payRent,

    'auction:new': room.auctionProperty,
    'auction:bid': room.placeBid,
    'auction:concede': room.concedeAuction,

    'trade:new': room.makeOffer,
    'trade:decline': room.declineOffer,
    'trade:accept': room.acceptOffer
  };

  for (let event in gameActions) {
    player.on(event, (...args) => {
      const promised = gameActions[event];
      promised(player, ...args).catch(emitError);
    });
  }
}
