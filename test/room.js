import http from 'http'
import assert from 'assert'
import io from 'socket.io-client'

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

  describe('join game', () => {

    it('The first player should join automatically', (done) => {
      client1.on('notice', (message) => {
        assert.ok(/joined game/.test(message))
        done()
      })

      client1.emit('join game', gameID, { name: 'Player 1' })
    })

    it('The player should not be able to join if already playing', (done) => {
      client2.on('notice', (message) => {

      })
    })

    it('The new player should be rejected if majority rules', (done) => {
      client2.on('notice', (message) => {
        assert.ok(/sorry/.test(message))
        done()
      })

      client1.on('poll', (pollID, message) => {
        client1.emit('vote', pollID, false)
      })

      client1.emit('join game', gameID, { name: 'Player 1' })
      client2.emit('join game', gameID, { name: 'Player 2' })
    })

    it('The new player should join after polling other players', (done) => {
      client2.on('notice', (message) => {
        assert.ok(/joined game/.test(message))
        done()
      })

      client1.on('poll', (pollID, message) => {
        assert.ok(/Player 2/.test(message))
        assert.ok(/join/.test(message))
        client1.emit('vote', pollID, true)
      })

      client1.emit('join game', gameID, { name: 'Player 1' })
      client2.emit('join game', gameID, { name: 'Player 2' })
    })

    it('The other players should be notified of the new player')

    it('The new player should be notified they joined')
  })
})
