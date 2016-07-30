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
  let gameID, client1, state

  beforeEach((done) => {
    client1 = io.connect(socketURL, socketOpts)
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

    it('first player should be able to join')

    it('should poll other players before joining')

    it('should deny player if majority rules')
  })
})
