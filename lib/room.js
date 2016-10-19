import { randomString } from './helpers'
import MonopolyGame from './game'

export default class MonopolyRoom {

  // All rooms
  static rooms = {}

  // Join room
  static joinRoom(name, token, socket, game) {
    this.rooms[game._id] = this.rooms[game._id] || new MonopolyRoom(game)
    this.rooms[game._id].join(name, token, socket)
  }

  // Setup room
  constructor(game) {
    this._id = game._id
    this.game = new MonopolyGame(game)

    this.players = new Map()
    this.polls = new Map()

    this.game.subscribe(() => {
      this.emit('update game', this.game.state)
    })
  }

  // Destroy room
  destroy() {
    delete this.constructor.rooms[this._id]
  }

  // Join game
  join(name, token, socket) {
    let player = this.game.state.players.find((p) => p.name === name && p.token === token)

    if (player && this.players.get(player._id)) {
      socket.emit('error message', `${name} is already playing`)
      return
    }

    let joinGame = () => {
      try {
        let pid = player ? player._id : this.game.join(name, token)
        this.addPlayer(pid, socket)
      } catch (e) {
        socket.emit('error message', e.message)
      }
    }

    if (!this.players.size) {
      joinGame()
      return
    }

    this.pollPlayers(`${name} would like to join the game`, (res) => {
      if (!res) {
        socket.emit('error message', 'Sorry, your friends hate you')
      } else {
        joinGame()
      }
    })
  }

  // Add player
  addPlayer(pid, socket) {
    let { name } = this.game.getPlayer(pid)
    this.io = this.io || socket.server.of('/game')

    let wrapped = (action, callback) => {
      socket.on(action, this.emitErrors(socket, callback))
    }

    let loaded = (callback, ctx) => {
      return (...args) => callback.call(ctx, pid, ...args)
    }

    socket.join(this._id)
    this.players.set(pid, socket)

    wrapped('vote', loaded(this.voteInPoll, this))

    wrapped('pay bank', loaded(this.game.payBank, this.game))
    wrapped('pay player', loaded(this.game.payPlayer, this.game))
    wrapped('collect money', loaded(this.game.collectMoney, this.game))

    wrapped('buy property', loaded(this.game.buyProperty, this.game))
    wrapped('pay rent', loaded(this.game.payRent, this.game))
    wrapped('improve property', loaded(this.game.improveProperty, this.game))
    wrapped('unimprove property', loaded(this.game.unimproveProperty, this.game))
    wrapped('mortgage property', loaded(this.game.mortgageProperty, this.game))
    wrapped('unmortgage property', loaded(this.game.unmortgageProperty, this.game))

    wrapped('claim bankruptcy', loaded(this.game.claimBankruptcy, this.game))

    socket.on('disconnect', () => {
      this.players.delete(pid)

      if (!this.players.size) {
        this.destroy()
      }
    })

    this.emit('notice', `${name} has joined the game`)
  }

  // Poll players
  pollPlayers(message, callback) {
    let majority = Math.ceil(this.players.size / 2)

    let pollID = randomString()
    while (this.polls.has(pollID)) {
      pollID = randomString()
    }

    let votes = new Map()
    this.players.forEach((s, pid) => votes.set(pid, 0))

    let timeout = setTimeout(() => this.closePoll(pollID), 30000)

    let poll = { message, callback, majority, votes, timeout }
    this.polls.set(pollID, poll)

    this.emit('new poll', pollID, message)
  }

  // Vote in a poll
  voteInPoll(pid, pollID, vote) {
    let poll = this.polls.get(pollID)

    if (poll.votes.has(pid)) {
      poll.votes.set(pid, vote ? 1 : -1)
    }

    let voted = 0
    let yes = 0

    poll.votes.forEach((vote) => {
      voted += vote ? 1 : 0
      yes += vote
    })

    let result = yes >= poll.majority
    poll.result = result

    if (poll.timeout) {
      clearTimeout(poll.timeout)
      poll.timeout = setTimeout(() => this.closePoll(pollID), 30000)
    }

    if (voted === poll.votes.size || result) {
      this.closePoll(pollID)
    }
  }

  // Close poll
  closePoll(pollID) {
    let poll = this.polls.get(pollID)
    let result = !!poll.result

    if (poll.timeout) {
      clearTimeout(poll.timeout)
    }

    if (poll.callback) {
      poll.callback(result)
    }

    this.polls.delete(pollID)

    this.emit('close poll', pollID, result)
  }

  // Emit errors to the socket
  emitErrors(socket, callback) {
    return (...args) => {
      try { callback(...args) }
      catch (e) { socket.emit('error message', e.message) }
    }
  }

  // Send events to players
  emit(...args) {
    if (this.io) {
      this.io.to(this._id).emit(...args)
    }
  }
}
