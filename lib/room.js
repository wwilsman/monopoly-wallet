import { assert, randomString } from './helpers'
import MonopolyGame from './game'

/**
 * Emits errors produced by the callback to the socket
 *
 * @param {object} socket
 * @param {function} callback
 */
function emitErrors(socket, callback) {
  try { callback() } catch (e) {
    if (e.name === 'MonopolyError') {
      socket.emit('game:error', {
        message: e.message
      })
    } else {
      socket.emit('room:error', {
        name: e.name,
        message: e.message
      })
    }
  }
}

/**
 * The Room Class
 */
export default class MonopolyRoom {

  /**
   * All rooms
   * @static
   */
  static rooms = {}

  /**
   * MongoDB instance
   * @static
   */
  static db = null

  /**
   * Connect to a room
   *
   * @static
   * @param {string} room
   * @param {object} socket
   */
  static connect(id, socket) {
    this.db.collection('games').findOne({ _id: id }, (err, game) => {
      if (err) {
        socket.emit('room:error', {
          name: err.name,
          message: err.message
        })
      } else if (!game) {
        socket.emit('room:error', {
          name: 'Error',
          message: 'Game not found'
        })
      } else {
        this.rooms[id] = this.rooms[id] || new MonopolyRoom(id, game)
        this.rooms[id].listen(socket)
      }
    })
  }

  /**
   * @constructor
   * @param {string} room
   * @param {object} game
   * @param {object} game.state
   * @param {object} game.config
   */
  constructor(id, { state, config }) {
    this.game = new MonopolyGame(config, state)
    this.id = id

    this.sockets = []
    this.players = new Map()
    this.polls = new Map()
    this.trades = new Map()

    this.game.subscribe(() => this.save())
  }

  /**
   * Destroy room
   */
  destroy() {
    delete this.constructor.rooms[this.id]
  }

  /**
   * Save the game and emit related events
   */
  save() {
    const game  = this.game.state

    this.constructor.db.collection('games').update(
      { _id: this.id }, { $set: { game } })

    this.sockets.forEach((s) => {
      s.emit('game:update', { game })
    })
  }

  /**
   * Send 
   */

  /**
   * Subscribe to new players and listen to join
   *
   * @param {object} socket
   */
  listen(socket) {
    this.io = this.io || socket.server

    // abort if the socket is already connected
    if (this.sockets.includes(socket)) return

    // sockets will always get new player updates
    this.sockets.push(socket)

    // join game action
    socket.once('game:join', ({ name, token }) => {
      emitErrors(socket, () => this.join(socket, name, token))
    })

    // when the last player disconnects, destroy the room
    socket.on('disconnect', () => {
      const i = this.sockets.indexOf(socket)
      this.sockets.splice(i, 1)

      if (!this.sockets.length) {
        this.destroy()
      }
    })

    // send initial data
    socket.emit('room:connected', {
      theme: this.game.config,
      game: {
        room: this.id,
        active: Array.from(this.players.keys()),
        ...this.game.state
      }
    })
  }

  /**
   * Join or ask to join a game
   *
   * @param {object} socket
   * @param {string} name
   * @param {string} token
   */
  join(socket, name, token) {
    const player = this.game.state.players.find((p) => p.token === token)

    // player is first to join
    if (!this.game.state.players.length) {
      this.game.join(name, token)
      this.add(token, socket)

    // player previously joined
    } else if (player && name === player.name) {
      if (this.players.has(token)) {
        socket.emit('game:error', {
          message: `{p:${token}} is already playing`
        })
      } else {
        this.add(token, socket)
      }

      // ask players to join
    } else if (!player) {
      this.pollPlayers(`{p:${token}} would like to join`, (res) => {
        if (!res) {
          socket.emit('room:error', {
            name: 'Sorry',
            error: 'Your friends hate you'
          })
        } else {
          this.game.join(name, token)
          this.add(token, socket)
        }
      })
    }
  }

  /**
   * Add a player to the room and set up events
   *
   * @param {string} token
   * @param {object} socket
   */
  add(token, socket) {
    
    // add the player to the room
    socket.join(this.id)
    this.players.set(token, socket)

    // remove player on disconnect
    socket.on('disconnect', () =>
      this.players.delete(token))

    // event -> handler map
    const events = {
      
      // polling events
      'poll:vote': ({ poll, vote }) =>
        this.voteInPoll(token, poll, vote),
      
      // game events
      'game:pay-bank': ({ amount }) =>
        this.game.payBank(token, amount),
      'game:collect-money': ({ amount }) =>
        this.game.collectMoney(token, amount),
      'game:pay-player': ({ player, amount }) =>
        this.game.payPlayer(token, player, amount),
      'game:pay-rent': ({ property, roll }) =>
        this.game.payRent(token, property, roll),
      'game:claim-bankruptcy': ({ beneficiary }) =>
        this.game.claimBankruptcy(token, beneficiary),
      'game:buy-property': ({ property, amount }) =>
        this.game.buyProperty(token, property, amount),
      'game:improve-property': ({ property }) =>
        this.game.improveProperty(token, property),
      'game:unimprove-property': ({ property, doMin }) =>
        this.game.unimproveProperty(token, property, doMin),
      'game:mortgage-property': ({ property }) =>
        this.game.mortgageProperty(token, property),
      'game:unmortgage-property': ({ property, noInterest }) =>
        this.game.unmortgageProperty(token, property, noInterest),
      'game:contest': ({ entry }) =>
        this.contestGame(token, entry),

      // auction events
      'auction:start': ({ property }) =>
        this.game.auctionProperty(token, property),
      'auction:bid': ({ property, amount }) =>
        this.game.placeAuctionBid(token, property, amount),
      'auction:concede': ({ property }) =>
        this.game.concedeAuction(token, property),

      // trading events
      'trade:offer': ({ player, trade }) =>
        this.game.makeTrade(token, player, trade),
      'trade:decline': ({ player }) =>
        this.game.cancelTrade(token, player),
      'trade:accept': ({ player }) =>
        this.game.finalizeTrade(token, player),

      // messaging events
      'message:send': ({ player, message }) =>
        this.messagePlayer(token, player, message)
    }

    // wrap events around error emitter
    for (let [action, fn] of Object.entries(events)) {
      socket.on(action, (data) => {
        emitErrors(socket, () => fn(data))
      })
    }

    // tell the socket we've joined
    socket.emit('game:joined', {
      game: this.game.state,
      player: token
    })

    // tell other sockets about the player
    this.sockets.forEach((s) => {
      s.emit('game:update', {
        game: { active: Array.from(this.players.keys()) }
      })
    })
  }

  /**
   * Poll players
   *
   * @param {string} message
   * @param {function} callback
   * @param {string} initiator
   */
  pollPlayers(message, callback, initiator) {
    const majority = Math.ceil(this.players.size / 2)
    const { pollTimeout } = this.game.config

    // unique poll ID
    let pollID = randomString()
    while (this.polls.has(pollID)) {
      pollID = randomString()
    }

    // initialize a map of player votes
    let votes = new Map()
    for (const token of this.players.keys()) {
      // the initiate player votes yes
      votes.set(token, token === initiator ? 1 : 0)
    }

    // auto-close poll after a timeout
    const timeout = setTimeout(() => this.closePoll(pollID), pollTimeout)

    // save poll data
    this.polls.set(pollID, { votes, callback, timeout })

    // send the poll
    this.emit('poll:new', {
      poll: pollID,
      message
    })
  }

  /**
   * Vote in a poll
   *
   * @param {string} token
   * @param {string} pollID
   * @param {boolean} vote
   */
  voteInPoll(token, pollID, vote) {
    let poll = this.polls.get(pollID)
    const { pollTimeout } = this.game.config

    if (!poll) return

    // change vote in poll
    if (poll.votes.has(token)) {
      poll.votes.set(token, vote ? 1 : -1)
    }

    // tally player votes
    let voted = 0
    let yes = 0

    for (const v of poll.votes.values()) {
      voted += v ? 1 : 0
      yes += v
    }

    // current poll status
    poll.result = yes >= Math.ceil(poll.votes.size / 2)


    // reset the timeout
    if (poll.timeout) {
      clearTimeout(poll.timeout)
      poll.timeout = setTimeout(() => this.closePoll(pollID), pollTimeout)
    }

    // close the poll once the last player votes or majority rules
    if (voted === poll.votes.size || poll.result === true) {
      this.closePoll(pollID)
    }
  }

  /**
   * Close poll
   *
   * @param {string} pollID
   */
  closePoll(pollID) {
    const poll = this.polls.get(pollID)

    if (!poll) return

    // remove the poll
    this.polls.delete(pollID)

    // make sure we don't close it twice
    if (poll.timeout) {
      clearTimeout(poll.timeout)
    }

    // poll callback with the result
    if (poll.callback) {
      poll.callback(poll.result)
    }

    // tell the players the poll has ended
    this.emit('poll:end', {
      poll: pollID,
      result: poll.result
    })
  }

  /**
   * Contest an action
   *
   * @param {string} token
   * @param {string} entryID
   */
  contestGame(token, entryID) {
    const socket = this.players.get(token)
    const player = this.game.getPlayer(token)

    // find the entry's index
    const { past, present } = this.game.store.getState()
    const index = present.entry === entryID ? past.length - 1 :
                  past.findIndex((s) => s.entry === entryID)

    // no info about this state
    if (index < 0 || !past[index].notice) return

    // get state information
    const { blame, message } = past[index].notice

    // if undoing the last entry and the player caused it, just undo
    if (index === past.length - 1 && blame.length === 1 && blame[0] === token) {
      return this.game.undo(entryID)
    }

    // poll other players before undoing the entry
    this.pollPlayers(`{p:${token}} is contesting when ${message}`, (result) => {
      if (!result) {
        socket.emit('game:error', {
          message: 'Sorry, your friends don\'t agree'
        })
      } else {
        this.game.undo(entryID)
      }
    }, token)
  }

  /**
   * Message another player
   *
   * @param {string} token
   * @param {string} toToken
   * @param {string} message
   */
  messagePlayer(token, toToken, message) {
    const socket = this.players.get(toToken)
    
    socket.emit('message:new', {
      player: token,
      message
    })
  }

  /**
   * Send events to players
   *
   * @param {string} event
   * @param {...*} args
   */
  emit(event, ...args) {
    if (this.io) {
      this.io.to(this.id).emit(event, ...args)
    }
  }
}
