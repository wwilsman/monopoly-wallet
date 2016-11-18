import '../server'
import http from 'http'
import assert from 'assert'
import io from 'socket.io-client'

import { tokens } from '../public/themes/classic/config'

const socketURL = 'http://localhost:3000/game'

const socketOpts = {
  transports: ['websocket'],
  'force new connection': true
}

const gameOptions = JSON.stringify({
  pollTimeout: 100,
  auctionTimeout: 100
})

const requestOpts = {
  hostname: 'localhost',
  port: 3000,
  path: '/new',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(gameOptions)
  }
}

describe('Room', () => {
  let gameID, client1, client2, state
  let p1 = { name: 'Player 1', token: tokens[0] }
  let p2 = { name: 'Player 2', token: tokens[1] }

  beforeEach((done) => {
    client1 = io.connect(socketURL, socketOpts)
    client2 = io.connect(socketURL, socketOpts)
    client1.on('game:update', (s) => state = s)

    http.request(requestOpts, (res) => {
      let data = [];

      res.on('data', (d) => data.push(d))

      res.on('end', () => {
        let d = JSON.parse(data.join(''))
        gameID = d.gameID
        done()
      })
    }).write(gameOptions)
  })

  afterEach(() => {
    client1.disconnect()
    client2.disconnect()
    gameID = null
    state = null
  })

  describe('Join Game', () => {

    it('The first player should join automatically', (done) => {
      client1.on('game:notice', (message) => {
        assert.ok(/Player 1 .* joined/.test(message))
        done()
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The player should not be able to join if already playing', (done) => {
      client1.on('game:error', (message) => {
        assert.ok(/already playing/.test(message))
        done()
      })

      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client1.emit('game:join', gameID, p1)
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The new player should be rejected if majority rules', (done) => {
      client2.on('game:error', (message) => {
        assert.ok(/Sorry/.test(message))
        done()
      })

      client1.on('poll:new', (pollID, message) => {
        client1.emit('poll:vote', pollID, false)
      })

      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The new player should poll other players before joining', (done) => {
      client1.on('poll:new', (pollID, message) => {
        assert.ok(/Player 2 .* join/.test(message))
        done()
      })

      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The other players should be notified of the new player', (done) => {
      client1.on('poll:new', (pollID, message) => {
        assert.ok(/Player 2 .* join/.test(message))
        client1.emit('poll:vote', pollID, true)
      })

      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          done()
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The new player should be notified they joined', (done) => {
      client2.on('game:notice', (message) => {
        assert.ok(/Player 2 .* joined/.test(message))
        done()
      })

      client1.on('poll:new', (pollID, message) => {
        assert.ok(/Player 2 .* join/.test(message))
        client1.emit('poll:vote', pollID, true)
      })

      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        }
      })

      client1.emit('game:join', gameID, p1)
    })
  })

  describe('Game Actions', () => {
    let testAction = (...args) => {
      let callback = args.pop()
      client1.on('game:update', callback)
      client1.on('game:error', callback)
      client1.emit(...args)
    }

    beforeEach((done) => {
      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          done()
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The room should respond to "game:pay-bank"', (done) => {
      testAction('game:pay-bank', 100, () => done())
    })

    it('The room should respond to "game:pay-player"', (done) => {
      testAction('game:pay-player', 'player-2', 100, () => done())
    })

    it('The room should respond to "game:collect-money"', (done) => {
      testAction('game:collect-money', 100, () => done())
    })

    it('The room should respond to "game:buy-property"', (done) => {
      testAction('game:buy-property', 'oriental-avenue', () => done())
    })

    it('The room should respond to "game:pay-rent"', (done) => {
      testAction('game:pay-rent', 'oriental-avenue', () => done())
    })

    it('The room should respond to "game:improve-property"', (done) => {
      testAction('game:improve-property', 'oriental-avenue', () => done())
    })

    it('The room should respond to "game:unimprove-property"', (done) => {
      testAction('game:unimprove-property', 'oriental-avenue', () => done())
    })

    it('The room should respond to "game:mortgage-property"', (done) => {
      testAction('game:mortgage-property', 'oriental-avenue', () => done())
    })

    it('The room should respond to "game:unmortgage-property"', (done) => {
      testAction('game:unmortgage-property', 'oriental-avenue', () => done())
    })

    it('The room should respond to "game:claim-bankruptcy"', (done) => {
      testAction('game:claim-bankruptcy', 'bank', () => done())
    })
  })

  describe('Polls', () => {

    it('The poll should expire after a timeout', (done) => {
      client1.on('poll:end', (pollID, result) => {
        assert.ok(!result)
        done()
      })

      client1.on('poll:new', (pollID, message) => {
        assert.ok(/Player 2 .* join/.test(message))
      })

      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The poll should close after majority rules', (done) => {
      let p3 = { name: 'Player 3', token: tokens[2] }
      let client3 = io.connect(socketURL, socketOpts)
      let poll = null

      client1.on('poll:end', (pollID, result) => {
        if (poll === pollID) {
          assert.ok(result)
          done()
        }
      })

      client1.on('poll:new', (pollID, message) => {
        client1.emit('poll:vote', pollID, true)

        if (/Player 3 .* join/.test(message)) {
          poll = pollID
        }
      })

      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client3.emit('game:join', gameID, p3)
        }
      })

      client2.on('poll:new', (pollID, message) => {
        client2.emit('poll:vote', pollID, true)
      })

      client1.emit('game:join', gameID, p1)
    })
  })

  describe('Auctions', () => {

    it('The player should auction a property', (done) => {
      client1.on('auction:new', (propertyID) => {
        assert.equal(propertyID, 'oriental-avenue')
        done()
      })

      client1.on('poll:new', (pollID, message) => {
        client1.emit('poll:vote', pollID, true)
      })

      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client2.emit('auction:start', 'oriental-avenue')
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The player must have enough to bid', (done) => {
      let bal1 = 0

      client1.on('game:error', (message) => {
        assert.ok(/Insufficient funds/.test(message))
        done()
      })

      client1.on('auction:new', (propertyID) => {
        client1.emit('auction:bid', propertyID, bal1 + 100)
      })

      client1.on('poll:new', (pollID, message) => {
        client1.emit('poll:vote', pollID, true)
      })

      client1.on('game:notice', (message) => {
        if (state && !bal1) {
          bal1 = state.players.find((p) => p.token === p1.token).balance
          assert.ok(bal1)
        }

        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client2.emit('auction:start', 'oriental-avenue')
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The bid must be higher than the current highest', (done) => {
      let p3 = { name: 'Player 3', token: tokens[2] }
      let client3 = io.connect(socketURL, socketOpts)
      let bal1 = 0

      client1.on('game:error', (message) => {
        assert.ok(/bid higher/.test(message))
        done()
      })

      client1.on('auction:update', (propertyID, winning, bid) => {
        assert.equal(winning, state.players.find((p) => p.token === p2.token)._id)
        assert.equal(bid, bal1)

        client1.emit('auction:bid', propertyID, bal1 / 2)
      })

      client2.on('auction:new', (propertyID) => {
        client2.emit('auction:bid', propertyID, bal1)
      })

      client1.on('poll:new', (pollID, message) => {
        client1.emit('poll:vote', pollID, true)
      })

      client2.on('poll:new', (pollID, message) => {
        client2.emit('poll:vote', pollID, true)
      })

      client1.on('game:notice', (message) => {
        if (state && !bal1) {
          bal1 = state.players.find((p) => p.token === p1.token).balance
          assert.ok(bal1)
        }

        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client3.emit('game:join', gameID, p3)
        } else if (/Player 3 .* joined/.test(message)) {
          client3.emit('auction:start', 'oriental-avenue')
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The player should not be able to bid after conceding', (done) => {
      let p3 = { name: 'Player 3', token: tokens[2] }
      let client3 = io.connect(socketURL, socketOpts)
      let player1 = null

      client1.on('game:error', (message) => {
        assert.ok(/conceded/.test(message))
        done()
      })

      client1.on('auction:update', (propertyID) => {
        client1.emit('auction:bid', propertyID, 100)
      })

      client1.on('auction:new', (propertyID) => {
        client1.emit('auction:concede', propertyID)
      })

      client1.on('poll:new', (pollID, message) => {
        client1.emit('poll:vote', pollID, true)
      })

      client2.on('poll:new', (pollID, message) => {
        client2.emit('poll:vote', pollID, true)
      })

      client1.on('game:notice', (message) => {
        if (state && !player1) {
          player1 = state.players.find((p) => p.token === p1.token)
        }

        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client3.emit('game:join', gameID, p3)
        } else if (/Player 3 .* joined/.test(message)) {
          client3.emit('auction:start', 'oriental-avenue')
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The auction should end once enough players concede', (done) => {
      let player2 = null

      client2.on('auction:end', (propertyID, winner) => {
        assert.equal(winner, player2._id)
        done()
      })

      client1.on('auction:new', (propertyID) => {
        client1.emit('auction:concede', propertyID)
      })

      client1.on('poll:new', (pollID, message) => {
        client1.emit('poll:vote', pollID, true)
      })

      client1.on('game:notice', (message) => {
        if (state && !player2) {
          player2 = state.players.find((p) => p.token === p2.token)
          assert.ok(player2)
        }

        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client2.emit('auction:start', 'oriental-avenue')
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The auction should end after a timeout', (done) => {
      client1.on('auction:end', (propertyID, winner) => {
        assert.equal(propertyID, 'oriental-avenue')
        assert.ok(!winner)
        done()
      })

      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client1.emit('auction:start', 'oriental-avenue')
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The winning bid should buy the property at that price', (done) => {
      let player1 = null

      client1.on('auction:end', (propertyID, winner) => {
        let bal1 = player1.balance

        player1 = state.players.find((p) => p.token === p1.token)

        assert.equal(winner, player1._id)
        assert.equal(player1.balance, bal1 - 100)
        done()
      })

      client1.on('auction:new', (propertyID) => {
        client1.emit('auction:bid', propertyID, 100)
      })

      client1.on('poll:new', (pollID, message) => {
        client1.emit('poll:vote', pollID, true)
      })

      client1.on('game:notice', (message) => {
        if (state && !player1) {
          player1 = state.players.find((p) => p.token === p1.token)
          assert.ok(player1)
        }

        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client2.emit('auction:start', 'oriental-avenue')
        }
      })

      client1.emit('game:join', gameID, p1)
    })
  })

  describe('Contesting', () => {
    let entryID

    beforeEach((done) => {
      client1.on('game:update', (state) => {
        if (/^Player 1 purchased Oriental Avenue/.test(state.note)) {
          entryID = state.entry
          done()
        }
      })

      client1.on('poll:new', (pollID, message) => {
        if (/Player 2 .* join/.test(message)) {
          client1.emit('poll:vote', pollID, true)
        }
      })

      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client1.emit('game:buy-property', 'oriental-avenue')
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The room should poll other players to undo a specific action', (done) => {
      client2.on('poll:new', (pollID, message) => {
        assert.ok(/Player 1 is contesting/.test(message))
        done()
      })

      client1.emit('game:contest', entryID)
    })

    it('The initiator should be notified when the vote is "no"', (done) => {
      let poll

      client1.on('poll:end', (pollID, result) => {
        assert.equal(poll, pollID)
        assert.ok(!result)
        done()
      })

      client2.on('poll:new', (pollID, message) => {
        if (/Player 1 is contesting/.test(message)) {
          client2.emit('poll:vote', pollID, false)
          poll = pollID
        }
      })

      client1.emit('game:contest', entryID)
    })

    it('The game state should be set to before the action was taken', (done) => {
      client1.on('game:update', (state) => {
        assert.ok(/Game reset/.test(state.note))
        done()
      })

      client2.on('poll:new', (pollID, message) => {
        if (/Player 1 is contesting/.test(message)) {
          client2.emit('poll:vote', pollID, true)
        }
      })

      client1.emit('game:contest', entryID)
    })
  })

  describe('Messaging', () => {
    let player1, player2

    beforeEach((done) => {
      client1.on('poll:new', (pollID, message) => {
        if (/Player 2 .* join/.test(message)) {
          client1.emit('poll:vote', pollID, true)
        }
      })

      client1.on('game:notice', (message) => {
        if (state && !player1 && !player2) {
          player1 = state.players.find((p) => p.token === p1.token)
          player2 = state.players.find((p) => p.token === p2.token)
          assert.ok(player1 && player2)
        }

        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          done()
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The room should curry the message to another player', (done) => {
      client2.on('message:new', (playerID, message) => {
        assert.equal(player1._id, playerID)
        assert.ok(/Test Message/.test(message))
        done()
      })

      client1.emit('message:send', player2._id, 'Test Message')
    })
  })

  describe('Trading', () => {
    let player1, player2

    beforeEach((done) => {
      client1.on('game:update', (state) => {
        if (/Player 1 purchased Oriental Avenue/.test(state.note)) {
          client2.emit('game:buy-property', 'st-james-place')
        } else if (/Player 2 purchased St\. James Place/.test(state.note)) {
          player1 = state.players.find((p) => p.token === p1.token)
          player2 = state.players.find((p) => p.token === p2.token)

          assert.equal(state.properties.find((p) => p._id === 'oriental-avenue').owner, player1._id)
          assert.equal(state.properties.find((p) => p._id === 'st-james-place').owner, player2._id)
          assert.ok(player1 && player2)
          done()
        }
      })

      client1.on('poll:new', (pollID, message) => {
        if (/Player 2 .* join/.test(message)) {
          client1.emit('poll:vote', pollID, true)
        }
      })

      client1.on('game:notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('game:join', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client1.emit('game:buy-property', 'oriental-avenue')
        }
      })

      client1.emit('game:join', gameID, p1)
    })

    it('The trade can only be accepted by the player who was offered', (done) => {
      client1.on('game:error', (message) => {
        assert.ok(/Player 2 didn't make you an offer/.test(message))
        done()
      })

      client2.on('trade:new', (tradeID) => {
        client1.emit('trade:accept', tradeID)
      })

      client1.emit('trade:offer', player2._id,
        { money: 100, properties: ['oriental-avenue'] },
        { properties: ['st-james-place'] })
    })

    it('The room should notify the other player of the offer', (done) => {
      client2.on('trade:new', (tradeID, pid, offer, trade) => {
        assert.equal(pid, player1._id)
        assert.equal(offer.money, 100)
        assert.equal(offer.properties.length, 1)
        assert.equal(offer.properties[0], 'oriental-avenue')
        assert.ok(!trade.money)
        assert.equal(trade.properties.length, 1)
        assert.equal(trade.properties[0], 'st-james-place')
        done()
      })

      client1.emit('trade:offer', player2._id,
        { money: 100, properties: ['oriental-avenue'] },
        { properties: ['st-james-place'] })
    })

    it('The trade should cancel when the other player declines', (done) => {
      client1.on('trade:declined', (tradeID, message) => {
        assert.ok(/Player 2 has declined/.test(message))
        done()
      })

      client2.on('trade:new', (tradeID) => {
        client2.emit('trade:decline', tradeID)
      })

      client1.emit('trade:offer', player2._id,
        { money: 100, properties: ['oriental-avenue'] },
        { properties: ['st-james-place'] })
    })

    it('The trade should occur when a player accepts an offer', (done) => {
      client1.on('game:update', (state) => {
        assert.ok(/Player 1 traded Player 2/.test(state.note))
        assert.equal(state.properties.find((p) => p._id === 'st-james-place').owner, player1._id)
        assert.equal(state.properties.find((p) => p._id === 'oriental-avenue').owner, player2._id)
        assert.equal(state.players.find((p) => p._id === player1._id).balance, player1.balance - 100)
        assert.equal(state.players.find((p) => p._id === player2._id).balance, player2.balance + 100)
        done()
      })

      client2.on('trade:new', (tradeID) => {
        client2.emit('trade:accept', tradeID)
      })

      client1.emit('trade:offer', player2._id,
        { money: 100, properties: ['oriental-avenue'] },
        { properties: ['st-james-place'] })
    })
  })
})
