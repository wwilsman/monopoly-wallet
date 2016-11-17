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
    client1.on('update game', (s) => state = s)

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
      client1.on('notice', (message) => {
        assert.ok(/Player 1 .* joined/.test(message))
        done()
      })

      client1.emit('join game', gameID, p1)
    })

    it('The player should not be able to join if already playing', (done) => {
      client1.on('error message', (message) => {
        assert.ok(/already playing/.test(message))
        done()
      })

      client1.on('notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client1.emit('join game', gameID, p1)
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The new player should be rejected if majority rules', (done) => {
      client2.on('error message', (message) => {
        assert.ok(/Sorry/.test(message))
        done()
      })

      client1.on('new poll', (pollID, message) => {
        client1.emit('vote', pollID, false)
      })

      client1.on('notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The new player should poll other players before joining', (done) => {
      client1.on('new poll', (pollID, message) => {
        assert.ok(/Player 2 .* join/.test(message))
        done()
      })

      client1.on('notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The other players should be notified of the new player', (done) => {
      client1.on('new poll', (pollID, message) => {
        assert.ok(/Player 2 .* join/.test(message))
        client1.emit('vote', pollID, true)
      })

      client1.on('notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          done()
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The new player should be notified they joined', (done) => {
      client2.on('notice', (message) => {
        assert.ok(/Player 2 .* joined/.test(message))
        done()
      })

      client1.on('new poll', (pollID, message) => {
        assert.ok(/Player 2 .* join/.test(message))
        client1.emit('vote', pollID, true)
      })

      client1.on('notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        }
      })

      client1.emit('join game', gameID, p1)
    })
  })

  describe('Game Actions', () => {
    let testAction = (...args) => {
      let callback = args.pop()
      client1.on('update game', callback)
      client1.on('error message', callback)
      client1.emit(...args)
    }

    beforeEach((done) => {
      client1.on('notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          done()
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The room should respond to "pay bank"', (done) => {
      testAction('pay bank', 100, () => done())
    })

    it('The room should respond to "pay player"', (done) => {
      testAction('pay player', 'player-2', 100, () => done())
    })

    it('The room should respond to "collect money"', (done) => {
      testAction('collect money', 100, () => done())
    })

    it('The room should respond to "buy property"', (done) => {
      testAction('buy property', 'oriental-avenue', () => done())
    })

    it('The room should respond to "pay rent"', (done) => {
      testAction('pay rent', 'oriental-avenue', () => done())
    })

    it('The room should respond to "improve property"', (done) => {
      testAction('improve property', 'oriental-avenue', () => done())
    })

    it('The room should respond to "unimprove property"', (done) => {
      testAction('unimprove property', 'oriental-avenue', () => done())
    })

    it('The room should respond to "mortgage property"', (done) => {
      testAction('mortgage property', 'oriental-avenue', () => done())
    })

    it('The room should respond to "unmortgage property"', (done) => {
      testAction('unmortgage property', 'oriental-avenue', () => done())
    })

    it('The room should respond to "claim bankruptcy"', (done) => {
      testAction('claim bankruptcy', 'bank', () => done())
    })
  })

  describe('Polls', () => {

    it('The poll should expire after a timeout', (done) => {
      client1.on('close poll', (pollID, result) => {
        assert.ok(!result)
        done()
      })

      client1.on('new poll', (pollID, message) => {
        assert.ok(/Player 2 .* join/.test(message))
      })

      client1.on('notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The poll should close after majority rules', (done) => {
      let p3 = { name: 'Player 3', token: tokens[2] }
      let client3 = io.connect(socketURL, socketOpts)
      let poll = null

      client1.on('close poll', (pollID, result) => {
        if (poll === pollID) {
          assert.ok(result)
          done()
        }
      })

      client1.on('new poll', (pollID, message) => {
        client1.emit('vote', pollID, true)

        if (/Player 3 .* join/.test(message)) {
          poll = pollID
        }
      })

      client1.on('notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client3.emit('join game', gameID, p3)
        }
      })

      client2.on('new poll', (pollID, message) => {
        client2.emit('vote', pollID, true)
      })

      client1.emit('join game', gameID, p1)
    })
  })

  describe('Auctions', () => {

    it('The player should auction a property', (done) => {
      client1.on('new auction', (propertyID) => {
        assert.equal(propertyID, 'oriental-avenue')
        done()
      })

      client1.on('new poll', (pollID, message) => {
        client1.emit('vote', pollID, true)
      })

      client1.on('notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client2.emit('new auction', 'oriental-avenue')
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The player must have enough to bid', (done) => {
      let bal1 = 0

      client1.on('error message', (message) => {
        assert.ok(/Insufficient funds/.test(message))
        done()
      })

      client1.on('new auction', (propertyID) => {
        client1.emit('place bid', propertyID, bal1 + 100)
      })

      client1.on('new poll', (pollID, message) => {
        client1.emit('vote', pollID, true)
      })

      client1.on('notice', (message) => {
        if (state && !bal1) {
          bal1 = state.players.find((p) => p.token === p1.token).balance
          assert.ok(bal1)
        }

        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client2.emit('new auction', 'oriental-avenue')
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The bid must be higher than the current highest', (done) => {
      let p3 = { name: 'Player 3', token: tokens[2] }
      let client3 = io.connect(socketURL, socketOpts)
      let bal1 = 0

      client1.on('error message', (message) => {
        assert.ok(/bid higher/.test(message))
        done()
      })

      client1.on('update auction', (propertyID, current, winning) => {
        assert.equal(winning, state.players.find((p) => p.token === p2.token)._id)
        assert.equal(current, bal1)

        client1.emit('place bid', propertyID, bal1 / 2)
      })

      client2.on('new auction', (propertyID) => {
        client2.emit('place bid', propertyID, bal1)
      })

      client1.on('new poll', (pollID, message) => {
        client1.emit('vote', pollID, true)
      })

      client2.on('new poll', (pollID, message) => {
        client2.emit('vote', pollID, true)
      })

      client1.on('notice', (message) => {
        if (state && !bal1) {
          bal1 = state.players.find((p) => p.token === p1.token).balance
          assert.ok(bal1)
        }

        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client3.emit('join game', gameID, p3)
        } else if (/Player 3 .* joined/.test(message)) {
          client3.emit('new auction', 'oriental-avenue')
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The player should not be able to bid after conceding', (done) => {
      let p3 = { name: 'Player 3', token: tokens[2] }
      let client3 = io.connect(socketURL, socketOpts)
      let player1 = null

      client1.on('error message', (message) => {
        assert.ok(/conceded/.test(message))
        done()
      })

      client1.on('update auction', (propertyID, current, winning, conceded) => {
        assert.notEqual(conceded.indexOf(player1._id), -1)
        client1.emit('place bid', propertyID, 100)
      })

      client1.on('new auction', (propertyID) => {
        client1.emit('concede auction', propertyID)
      })

      client1.on('new poll', (pollID, message) => {
        client1.emit('vote', pollID, true)
      })

      client2.on('new poll', (pollID, message) => {
        client2.emit('vote', pollID, true)
      })

      client1.on('notice', (message) => {
        if (state && !player1) {
          player1 = state.players.find((p) => p.token === p1.token)
        }

        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client3.emit('join game', gameID, p3)
        } else if (/Player 3 .* joined/.test(message)) {
          client3.emit('new auction', 'oriental-avenue')
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The auction should end once enough players concede', (done) => {
      let player2 = null

      client2.on('end auction', (propertyID, winner) => {
        assert.equal(winner, player2._id)
        done()
      })

      client1.on('new auction', (propertyID) => {
        client1.emit('concede auction', propertyID)
      })

      client1.on('new poll', (pollID, message) => {
        client1.emit('vote', pollID, true)
      })

      client1.on('notice', (message) => {
        if (state && !player2) {
          player2 = state.players.find((p) => p.token === p2.token)
          assert.ok(player2)
        }

        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client2.emit('new auction', 'oriental-avenue')
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The auction should end after a timeout', (done) => {
      client1.on('end auction', (propertyID, winner) => {
        assert.equal(propertyID, 'oriental-avenue')
        assert.ok(!winner)
        done()
      })

      client1.on('notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client1.emit('new auction', 'oriental-avenue')
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The winning bid should buy the property at that price', (done) => {
      let player1 = null

      client1.on('end auction', (propertyID, winner) => {
        let bal1 = player1.balance

        player1 = state.players.find((p) => p.token === p1.token)

        assert.equal(winner, player1._id)
        assert.equal(player1.balance, bal1 - 100)
        done()
      })

      client1.on('new auction', (propertyID) => {
        client1.emit('place bid', propertyID, 100)
      })

      client1.on('new poll', (pollID, message) => {
        client1.emit('vote', pollID, true)
      })

      client1.on('notice', (message) => {
        if (state && !player1) {
          player1 = state.players.find((p) => p.token === p1.token)
          assert.ok(player1)
        }

        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client2.emit('new auction', 'oriental-avenue')
        }
      })

      client1.emit('join game', gameID, p1)
    })
  })

  describe('Contesting', () => {
    let entryID

    beforeEach((done) => {
      client1.on('update game', (state) => {
        if (/^Player 1 purchased Oriental Avenue/.test(state.note)) {
          entryID = state.entry
          done()
        }
      })

      client1.on('new poll', (pollID, message) => {
        if (/Player 2 .* join/.test(message)) {
          client1.emit('vote', pollID, true)
        }
      })

      client1.on('notice', (message) => {
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          client1.emit('buy property', 'oriental-avenue')
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The room should poll other players to undo a specific action', (done) => {
      client2.on('new poll', (pollID, message) => {
        assert.ok(/Player 1 is contesting/.test(message))
        done()
      })

      client1.emit('contest', entryID)
    })

    it('The initiator should be notified when the vote is "no"', (done) => {
      let poll

      client1.on('close poll', (pollID, result) => {
        assert.equal(poll, pollID)
        assert.ok(!result)
        done()
      })

      client2.on('new poll', (pollID, message) => {
        if (/Player 1 is contesting/.test(message)) {
          client2.emit('vote', pollID, false)
          poll = pollID
        }
      })

      client1.emit('contest', entryID)
    })

    it('The game state should be set to before the action was taken', (done) => {
      client1.on('update game', (state) => {
        assert.ok(/Game reset/.test(state.note))
        done()
      })

      client2.on('new poll', (pollID, message) => {
        if (/Player 1 is contesting/.test(message)) {
          client2.emit('vote', pollID, true)
        }
      })

      client1.emit('contest', entryID)
    })
  })

  describe('Messaging', () => {
    let player1, player2

    beforeEach((done) => {
      client1.on('new poll', (pollID, message) => {
        if (/Player 2 .* join/.test(message)) {
          client1.emit('vote', pollID, true)
        }
      })

      client1.on('notice', (message) => {
        if (state && !player1 && !player2) {
          player1 = state.players.find((p) => p.token === p1.token)
          player2 = state.players.find((p) => p.token === p2.token)
          assert.ok(player1 && player2)
        }
        
        if (/Player 1 .* joined/.test(message)) {
          client2.emit('join game', gameID, p2)
        } else if (/Player 2 .* joined/.test(message)) {
          done()
        }
      })

      client1.emit('join game', gameID, p1)
    })

    it('The room should curry the message to another player', (done) => {
      client2.on('new message', (playerID, message) => {
        assert.equal(player1._id, playerID)
        assert.ok(/Test Message/.test(message))
        done()
      })

      client1.emit('send message', player2._id, 'Test Message')
    })
  })

  describe('Trading', () => {

    it('The room should notify the other player of the offer')

    it('The transaction should occur when players make the same offer')

    it('The offer should be updated when the other player counters')

    it('The players should be notified when an offer is updated')
  })
})
