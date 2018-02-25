import GameRoom from './room';

/**
 * Emits an error to the socket
 * @param {WebSocket} ws - WebSocket instance
 * @param {Error|Object} error - Error or Error-like object
 */
function socketError(ws, error) {
  let { name, message } = error;
  let type = name === 'MonopolyError' ? 'game' : 'room';

  socketEmitEvent(ws, `${type}:error`, {
    error: { name, message }
  });
}

/**
 * Emits an event to the socket with arguments
 * @param {WebSocket} ws - WebSocket instance
 * @param {String} name - Event name
 * @param {Object} data - Event data
 */
function socketEmitEvent(ws, name, data) {
  // a socket might not be open if it disconnects before receiving
  // an expected event
  if (ws.readyState === 1) {
    ws.send(JSON.stringify({ name, data }));
  }
}

/**
 * Sets up a socket for interacting with a game room
 * @param {WebSocket} ws - WebSocket instance
 */
export default function connectSocket(ws) {
  let emitError = socketError.bind(null, ws);
  let emitEvent = socketEmitEvent.bind(null, ws);

  // some actions need a room, this room will be available once the
  // socket has connected to the game room via `room:connect`
  let room = false;
  let withRoom = (fn) => (...args) => {
    if (room) fn(...args);
  };

  // game actions require a token, this token will be available once
  // the player has successfully joined a game room
  let token = false;
  let withToken = (fn) => (...args) => {
    if (token) fn(...args);
  };

  // wrap room methods to pass the token as the first argument,
  // emit an update, and catch any errors
  let gameMethod = (name) => withRoom(
    withToken((...args) => {
      room[name](token, ...args)
        .then(() => emitEvent('game:update', {
          game: room.game
        }))
        .catch(emitError);
    })
  );

  // available socket actions
  let actions = {
    // create a game and connect to it
    'game:new': (config) => {
      GameRoom.new(config).then(({ id: room, ...game }) => {
        emitEvent('game:created', { room, ...game });
        actions['room:connect'](room);
      }).catch(emitError);
    },

    // connect to an existing game
    'room:connect': (id) => {
      GameRoom.connect(id, ws).then((r) => {
        if (!room) {
          // unblock room-required actions
          room = r;

          // on close, remove the socket from the room
          ws.on('close', () => room.disconnect(ws));

          // keep the room state in sync when other players make changes.
          // the sync event receives the meta that triggered it
          room.on('sync', (blame) => {
            if (blame !== ws) {
              emitEvent('room:sync', room.state);
            }
          }, ws);
        }

        // tell the socket it's connected
        emitEvent('room:connected', room.state);
      }).catch(emitError);
    },

    // disconnect from a game
    'room:disconnect': withRoom(() => {
      room.disconnect(ws);
    }),

    // join the game if available
    'game:join': withRoom((name, t) => {
      askRoomToJoin(room, ws, name, t).then(() => {
        // make game actions available
        token = t;

        // tell our player about polls
        room.on('poll:new', (poll) => {
          emitEvent('poll:new', { poll });
        }, ws);

        room.on('poll:end', (poll) => {
          emitEvent('poll:end', { poll });
        }, ws);

        // tell our player about notices
        room.on('notice', (notice) => {
          emitEvent('notice:new', { notice });
        }, ws);

        // tell the player they've joined
        emitEvent('game:joined', {
          ...room.state,
          notice: room.notice('player.joined', { player: { name } }),
          player: { name, token }
        });
      }).catch(emitError);
    }),

    // players are allowed to vote in a poll
    'poll:vote': withToken((id, vote) => {
      room.vote(token, id, vote);
    }),

    // players are allowed to message others in the room
    'message:send': withToken((to, message) => {
      let player = room.players.get(to);

      if (player) {
        socketEmitEvent(player, 'message:received', {
          message: {
            content: message,
            from: token
          }
        });
      } else {
        emitError(room.error('player.not-found', {
          player: { token: to }
        }));
      }
    }),

    // game actions are available to players that have successfully joined
    'player:transfer': gameMethod('makeTransfer'),
    'player:claim-bankruptcy': gameMethod('claimBankruptcy'),

    'property:buy': gameMethod('buyProperty'),
    'property:improve': gameMethod('improveProperty'),
    'property:unimprove': gameMethod('unimproveProperty'),
    'property:mortgage': gameMethod('mortgageProperty'),
    'property:unmortgage': gameMethod('unmortgageProperty'),
    'property:pay-rent': gameMethod('payRent'),

    'auction:new': gameMethod('auctionProperty'),
    'auction:bid': gameMethod('placeBid'),
    'auction:concede': gameMethod('concedeAuction'),

    'trade:new': gameMethod('makeOffer'),
    'trade:decline': gameMethod('declineOffer'),
    'trade:accept': gameMethod('acceptOffer')
  };

  // execute an action if it's available
  ws.on('message', (payload) => {
    let { event, args } = JSON.parse(payload);

    if (actions[event]) {
      actions[event](...args);
    }
  });

  // on error, terminate the socket
  ws.on('error', () => ws.terminate());

  // tell the socket it's connected
  emitEvent('connected');
}

/**
 * Joins or asks to join the current game
 * @param {GameRoom} room - GameRoom instance
 * @param {WebSocket} ws - WebSocket instance
 * @param {String} name - Player name
 * @param {String} token - Player token
 * @returns {Promise} Resolves when the player has joined, rejects when
 * the poll resolves to false
 */
function askRoomToJoin(room, ws, name, token) {
  if (Array.from(room.players.values()).includes(ws)) {
    return Promise.reject(room.error('player.playing'));

  } else if (!room.players.size || room.game.players[token]) {
    return room.join(name, token, ws);

  } else {
    const ask = room.notice('player.ask-to-join', { player: { name }});

    return room.poll(ask).then((result) => {
      if (!result) throw room.error('player.denied');
      return room.join(name, token, ws);
    });
  }
}
