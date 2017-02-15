import { assert, randomString } from './helpers'
import MonopolyGame from './game'

export default class MonopolyRoom {

  // All rooms
  static rooms = {}

  // MongoDB
  static db = null

  // Join room
  static joinRoom(_id, player) {
    MonopolyRoom.db.collection('games').findOne({ _id }, (err, game) => {
      if (err) {
        player.socket.emit('game:error', err.name, err.message)
      } else if (!game) {
        player.socket.emit('game:error', 'Error', 'Game not found')
      } else {
        this.rooms[_id] = this.rooms[_id] || new MonopolyRoom(game)
        this.rooms[_id].join(player)
      }
    })
  }

  // Setup room
  constructor(game) {
    this._id = game._id
    this.game = new MonopolyGame(game)
    this.db = this.constructor.db

    this.players = new Map()
    this.polls = new Map()
    this.trades = new Map()

    this.game.subscribe((silent) => {
      this.updateDatabase()
      this.emit('game:update', this.game.state)

      if (!silent) {
        this.sendNotices()
      }
    })
  }

  // Destroy room
  destroy() {
    delete this.constructor.rooms[this._id]
  }

  // Update the database
  updateDatabase() {
    this.db.collection('games').update(
      { _id: this._id },
      { $set: this.game.state }
    )
  }

  // Join game
  join({ socket, name, token }) {
    this.io = this.io || socket.server.of('/game')

    let player = this.game.state.players.find((p) => {
      return p.name === name && p.token === token
    })

    if (player && this.players.get(token)) {
      socket.emit('game:error', `${name} is already playing`)
      return
    }

    let joinGame = () => {
      this.emitErrors(socket, () => {
        if (!player) {
          this.game.join(name, token)
        }

        this.addPlayer(token, socket)

        if (!player) {
          this.sendNotices(socket)
        }
      })
    }

    if (!this.players.size || player) {
      joinGame()
      return
    }

    this.pollPlayers(`${name} would like to join the game`, (result) => {
      if (!result) {
        socket.emit('game:error', 'Sorry', 'Your friends hate you')
      } else {
        joinGame()
      }
    })
  }

  // Add player
  addPlayer(token, socket) {
    let player = this.game.getPlayer(token)

    let on = (action, callback, ctx = this) => {
      socket.on(action, (...args) => {
        this.emitErrors(socket, () => {
          callback.call(ctx, token, ...args)
        })
      })
    }

    socket.join(this._id)
    this.players.set(token, socket)

    // polling
    on('poll:vote', this.voteInPoll)

    // auctioning
    on('auction:start', this.startAuction)
    on('auction:bid', this.placeBid)
    on('auction:concede', this.concedeAuction)

    // game commands
    on('game:pay-bank', this.game.payBank, this.game)
    on('game:pay-player', this.game.payPlayer, this.game)
    on('game:collect-money', this.game.collectMoney, this.game)
    on('game:buy-property', this.game.buyProperty, this.game)
    on('game:pay-rent', this.game.payRent, this.game)
    on('game:improve-property', this.game.improveProperty, this.game)
    on('game:unimprove-property', this.game.unimproveProperty, this.game)
    on('game:mortgage-property', this.game.mortgageProperty, this.game)
    on('game:unmortgage-property', this.game.unmortgageProperty, this.game)
    on('game:claim-bankruptcy', this.game.claimBankruptcy, this.game)

    // contesting
    on('game:contest', this.contestGame)

    // messaging
    on('message:send', this.messagePlayer)

    // trading
    on('trade:offer', this.makeOffer)
    on('trade:accept', this.acceptOffer)
    on('trade:decline', this.declineOffer)

    socket.on('disconnect', () => {
      this.players.delete(token)

      if (!this.players.size) {
        this.destroy()
      }
    })

    socket.emit('game:joined', token, this.game.state)
  }

  // Poll players
  pollPlayers(message, callback, initiator) {
    let majority = Math.ceil(this.players.size / 2)
    let { pollTimeout } = this.game.config

    let pollID = randomString()
    while (this.polls.has(pollID)) {
      pollID = randomString()
    }

    let votes = new Map()
    for (let token of this.players.keys()) {
      votes.set(token, token === initiator ? 1 : 0)
    }

    let timeout = setTimeout(() => this.closePoll(pollID), pollTimeout)

    let poll = { message, callback, majority, votes, timeout }
    this.polls.set(pollID, poll)

    this.emit('poll:new', pollID, message)
  }

  // Vote in a poll
  voteInPoll(token, pollID, vote) {
    let poll = this.polls.get(pollID)
    let { pollTimeout } = this.game.config

    if (!poll) return

    if (poll.votes.has(token)) {
      poll.votes.set(token, vote ? 1 : -1)
    }

    let voted = 0
    let yes = 0

    for (let v of poll.votes.values()) {
      voted += v ? 1 : 0
      yes += v
    }

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

    if (!poll) return

    if (poll.timeout) {
      clearTimeout(poll.timeout)
    }

    if (poll.callback) {
      poll.callback(result)
    }

    this.polls.delete(pollID)

    this.emit('poll:end', pollID, result)
  }

  // Create auction
  startAuction(token, propertyName, start = 0) {
    let property = this.game.getProperty(propertyName)
    let { auctionTimeout } = this.game.config

    assert('There is already an active auction', this.auction)
    assert('Cannot auction player properties', property.owner !== 'bank')

    let timeout = setTimeout(() => this.endAuction(), auctionTimeout)

    this.auction = {
      property: propertyName,
      bids: new Map(),
      winning: null,
      current: 0,
      timeout,
      start
    }

    for (let key of this.players.keys()) {
      this.auction.bids.set(key, 0)
    }

    this.emit('auction:new', propertyName, start)
  }

  // Bid in auction
  placeBid(token, propertyName, bid) {
    let auction = this.auction
    let player = this.game.getPlayer(token)
    let property = this.game.getProperty(propertyName)
    let { auctionTimeout } = this.game.config

    assert(`${property.name} is not up for auction`, !auction || auction.property !== propertyName)
    assert('You\'ve conceded from this auction', !auction.bids.has(token))
    assert('Insufficient funds', player.balance < bid)

    assert('You\'re already winning this auction', auction.winning === token)
    assert(`You need to bid higher than ${auction.current || auction.start}`,
      auction.current >= bid || auction.start >= bid)

    auction.bids.set(token, bid)

    for (let [id, amount] of auction.bids) {
      auction.current = Math.max(auction.current, amount)
      auction.winning = auction.current === amount ? id : auction.winning
    }

    if (auction.timeout) {
      clearTimeout(auction.timeout)
      auction.timeout = setTimeout(() => this.endAuction(), auctionTimeout)
    }

    for (let t of auction.bids.keys()) {
      let pl = this.game.getPlayer(t)

      if (pl.balance < auction.current) {
        auction.bids.delete(id)
      }
    }

    this.emit('auction:update', propertyName, auction.winning, auction.current)
  }

  // Concede from auction
  concedeAuction(token, propertyName) {
    let auction = this.auction
    let property = this.game.getProperty(propertyName)

    assert(`${property.name} is not up for auction`,
      !auction || auction.property !== propertyName)
    assert('You already conceded from this auction', !auction.bids.has(token))

    auction.bids.delete(token)

    for (let [id, amount] of auction.bids) {
      auction.current = Math.max(auction.current, amount)
      auction.winning = auction.current === amount ? id : auction.winning
    }

    if (auction.bids.size > 1) {
      this.emit('auction:update', propertyName, auction.winning, auction.current)
    } else {
      this.endAuction()
    }
  }

  // End auction
  endAuction() {
    let auction = this.auction

    if (!auction) return

    if (auction.timeout) {
      clearTimeout(auction.timeout)
    }

    if (auction.winning) {
      this.emitErrors(this.players.get(auction.winning), () => {
        this.game.buyProperty(auction.winning, auction.property, auction.current)
      })
    }

    this.emit('auction:end', auction.property, auction.winning)
    this.auction = null
  }

  // Contest an action
  contestGame(token, entryID) {
    let socket = this.players.get(token)
    let player = this.game.getPlayer(token)

    let { past, present } = this.game.store.getState()
    let index = present.entry === entryID ? past.length - 1 :
      past.reduce((t, e, i) => e.entry === entryID ? i - 1 : t, -1)

    if (index < 0) return

    this.pollPlayers(`${player.name} is contesting when ${past[index].note}`, (result) => {
      if (!result) {
        socket.emit('game:error', 'Sorry, your friends don\'t agree')
      } else {
        this.game.undo(entryID)
      }
    }, token)
  }

  // Message another player
  messagePlayer(token, otherPlayer, message) {
    let socket = this.players.get(otherPlayer)
    socket.emit('message:new', token, message)
  }

  // Make a trade offer to another player
  makeOffer(token, otherPlayer, offer, trade) {
    let socket = this.players.get(otherPlayer)
    let tradeID = `${otherPlayer}/${token}`
    let tradeOffer = this.trades.get(tradeID)

    if (!tradeOffer) {
      tradeID = `${token}/${otherPlayer}`
    }

    this.trades.set(tradeID, {
      player: token,
      with: otherPlayer,
      offer,
      trade
    })

    socket.emit('trade:new', tradeID, token, offer, trade)
  }

  // Accept a trade offer made by another player
  acceptOffer(token, tradeID) {
    let tradeOffer = this.trades.get(tradeID)
    let player = this.game.getPlayer(tradeOffer.player === token ?
      tradeOffer.with : tradeOffer.player)
    let socket = this.players.get(player.token)

    assert(`${player.name} didn't make you an offer`, tradeOffer.with !== token)

    this.game.makeTrade({
      player: tradeOffer.player,
      ...tradeOffer.offer
    }, {
      player: tradeOffer.with,
      ...tradeOffer.trade
    })

    this.trades.delete(tradeID)

    socket.emit('trade:end', tradeID)
  }

  // Decline an offer made by another player
  declineOffer(token, tradeID) {
    let tradeOffer = this.trades.get(tradeID)
    let player = this.game.getPlayer(token)
    let otherPlayer = this.game.getPlayer(tradeOffer.player)

    assert(`${otherPlayer.name} didn't make you an offer`,
      tradeOffer.with !== token && tradeOffer.player !== token)

    if (tradeOffer.with === token) {
      let socket = this.players.get(tradeOffer.player)
      socket.emit('trade:declined', tradeID, `${player.name} has declined your offer`)
    } else {
      socket.emit('trade:end', tradeID)
    }

    this.trades.delete(tradeID)
  }

  // Send notices to the players about the last state of the game
  sendNotices(socket) {
    let { note, blame } = this.game.state

    this.players.forEach((s, token) => {
      if (blame.indexOf(token) !== -1) {
        let player = this.game.getPlayer(token)
        note = note.replace(new RegExp(`\\b${player.name}\\b`), 'YOU')
      }

      if (!socket || socket === s) {
        s.emit('game:notice', note)
      }
    })
  }

  // Emit errors to the socket
  emitErrors(socket, callback) {
    try { callback() }
    catch (e) { socket.emit('game:error', e.message) }
  }

  // Send events to players
  emit(...args) {
    if (this.io) {
      this.io.to(this._id).emit(...args)
    }
  }
}
