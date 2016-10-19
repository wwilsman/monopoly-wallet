import http from 'http'
import assert from 'assert'
import io from 'socket.io-client'

import { tokens } from '../public/themes/classic/config'

const socketURL = 'http://localhost:3000/game'

const socketOpts = {
  transports: ['websocket'],
  'force new connection': true
}

const requestOpts = {
  hostname: 'localhost',
  port: 3000,
  path: '/new',
  method: 'POST',
}

describe('Room', () => {
  let gameID, client1, client2, state

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
    }).end()
  })

  afterEach(() => {
    client1.disconnect()
    client2.disconnect()
  })

  describe('Join Game', () => {
    let p1, p2

    beforeEach(() => {
      p1 = { name: 'Player 1', token: tokens[0] }
      p2 = { name: 'Player 2', token: tokens[1] }
    })

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
    let p1

    let testAction = (...args) => {
      let callback = args.pop()
      client1.on('update game', callback)
      client1.on('error message', callback)
      client1.emit(...args)
    }

    beforeEach((done) => {
      p1 = { name: 'Player 1', token: tokens[0] }

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

  describe('Voting', () => {

    it('The poll should already exist')

    it('The poll should expire after a timeout')

    it('The poll should close after majority rules')

    it('The poll\'s action should be called when closed')
  })

  describe('Bidding', () => {

    it('There must be an active auction')

    it('The player must have enough to bid')

    it('The bid must be higher than the current highest')

    it('The auction timer should reset after each bid')

    it('The winning bid should buy the property at that price')
  })

  describe('Vetoing', () => {

    it('The room should poll other players to undo a specific action')

    it('The initiator should be notified when the vote is "no"')

    it('The game state should be set to before the action was taken')
  })

  describe('Messaging', () => {

    it('The room should curry the message to another player')
  })

  describe('Trading', () => {

    it('The room should notify the other player of the offer')

    it('The transaction should occur when players make the same offer')

    it('The offer should be updated when the other player counters')

    it('The players should be notified when an offer is updated')
  })
})
