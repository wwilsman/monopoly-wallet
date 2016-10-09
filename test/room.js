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

  describe('join game', () => {
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
})
