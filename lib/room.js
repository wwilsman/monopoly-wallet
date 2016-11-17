import { assert, randomString } from './helpers'
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

    // polls
    wrapped('vote', loaded(this.voteInPoll, this))

    // auction
    wrapped('new auction', loaded(this.createAuction, this))
    wrapped('place bid', loaded(this.placeBid, this))
    wrapped('concede auction', loaded(this.concedeAuction, this))

    // game actions
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

    // contesting
    wrapped('contest', loaded(this.contestGame, this))

    // messaging
    wrapped('send message', loaded(this.messagePlayer, this))

    socket.on('disconnect', () => {
      this.players.delete(pid)

      if (!this.players.size) {
        this.destroy()
      }
    })

    this.emit('notice', `${name} has joined the game`)
  }

  // Poll players
  pollPlayers(message, callback, initiator) {
    let majority = Math.ceil(this.players.size / 2)
    let { pollTimeout } = this.game.state

    let pollID = randomString()
    while (this.polls.has(pollID)) {
      pollID = randomString()
    }

    let votes = new Map()
    this.players.forEach((s, pid) => {
      votes.set(pid, pid === initiator ? 1 : 0)
    })

    let timeout = setTimeout(() => this.closePoll(pollID), pollTimeout)

    let poll = { message, callback, majority, votes, timeout }
    this.polls.set(pollID, poll)

    this.emit('new poll', pollID, message)
  }

  // Vote in a poll
  voteInPoll(pid, pollID, vote) {
    let poll = this.polls.get(pollID)
    let { pollTimeout } = this.game.state

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
      poll.timeout = setTimeout(() => this.closePoll(pollID), pollTimeout)
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

  // Create auction
  createAuction(pid, propertyID, start = 0) {
    let { auctionTimeout } = this.game.state

    assert('There is already an active auction', this.auction && this.auction.property !== propertyID)

    let timeout = setTimeout(() => this.endAuction(), auctionTimeout)

    this.auction = {
      property: propertyID,
      winning: null,
      conceded: [],
      current: 0,
      timeout,
      start
    }

    this.emit('new auction', propertyID, start)
  }

  // Bid in auction
  placeBid(pid, propertyID, bid) {
    let player = this.game.getPlayer(pid)
    let property = this.game.getProperty(propertyID)
    let { auctionTimeout } = this.game.state

    assert(`${property.name} is not up for auction`, !this.auction || this.auction.property !== propertyID)
    assert('You\'ve conceded from this auction', this.auction.conceded.indexOf(pid) > -1)
    assert('You\'re already winning this auction', this.auction.winning === pid)
    assert('Insufficient funds', player.balance < bid)
    assert(`You need to bid higher than ${this.auction.current || this.auction.start}`,
      this.auction.current >= bid || this.auction.start >= bid)

    if (this.auction.timeout) {
      clearTimeout(this.auction.timeout)
      this.auction.timeout = setTimeout(() => this.endAuction(), auctionTimeout)
    }

    let { conceded } = this.auction
    let current = this.auction.current = bid
    let winning = this.auction.winning = pid

    this.emit('update auction', propertyID, current, winning, conceded)
  }

  // Concede from auction
  concedeAuction(pid, propertyID) {
    let property = this.game.getProperty(propertyID)

    assert(`${property.name} is not up for auction`, !this.auction || this.auction.property !== propertyID)
    assert('You\'re already conceded from this auction', this.auction.conceded.indexOf(pid) > -1)

    this.auction.conceded.push(pid)
    let { current, winning, conceded } = this.auction

    if (conceded.length < this.players.size - 1) {
      this.emit('update auction', propertyID, current, winning, conceded)
    } else {
      if (!winning) {
        let player = this.game.state.players.find((p) => conceded.indexOf(p._id) === -1)
        this.auction.winning = player._id
      }

      this.endAuction()
    }
  }

  // End auction
  endAuction() {
    if (this.auction) {
      let { property, current, winning } = this.auction

      if (this.auction.timeout) {
        clearTimeout(this.auction.timeout)
      }

      if (winning) {
        this.game.buyProperty(winning, property, current)
      }

      this.emit('end auction', property, winning)
      this.auction = null
    }
  }

  // Contest an action
  contestGame(pid, entryID) {
    let socket = this.players.get(pid)
    let player = this.game.getPlayer(pid)

    let { past, present } = this.game.store.getState()
    let index = present.entry === entryID ? past.length - 1 :
      past.reduce((t, e, i) => e.entry === entryID ? i - 1 : t, -1)

    this.pollPlayers(`${player.name} is contesting when ${past[index].note}`, (res) => {
      if (!res) {
        socket.emit('error message', 'Sorry, your friends don\'t agree')
      } else {
        this.game.undo(entryID)
      }
    }, pid)
  }

  // Message another player
  messagePlayer(pid, otherPlayer, message) {
    let socket = this.players.get(otherPlayer)

    socket.emit('new message', pid, message)
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
