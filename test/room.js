import '../lib/server'
import http from 'http'
import assert from 'assert'
import io from 'socket.io-client'
import config from '../config'

import gameConfig from '../public/themes/classic/config.json'
const { playerTokens:tokens } = gameConfig

const socketOpts = {
  transports: ['websocket'],
  forceNew: true
}

const gameOptions = JSON.stringify({
  pollTimeout: 100
})

const requestOpts = {
  hostname: config.host,
  port: config.port,
  path: '/api/new',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(gameOptions)
  }
}

describe('Room', () => {
  let room, client1, client2
  let p1 = { name: 'player 1', token: tokens[0] }
  let p2 = { name: 'player 2', token: tokens[1] }

  beforeEach((done) => {
    client1 = io.connect(config.uri, socketOpts)
    client2 = io.connect(config.uri, socketOpts)

    http.request(requestOpts, (res) => {
      let data = [];

      res.on('data', (d) => data.push(d))

      res.on('end', () => {
        const d = JSON.parse(data.join(''))
        room = d.room

        client2.once('room:connected', () => done())

        client1.once('room:connected', () =>
          client2.emit('room:connect', { room }))

        client1.emit('room:connect', { room })
      })
    }).write(gameOptions)
  })

  afterEach(() => {
    client1.disconnect()
    client2.disconnect()
    room = null
  })

  describe('Join Game', () => {

    it('The first player should join automatically', (done) => {
      client1.on('game:joined', () => done())
      client1.emit('game:join', p1)
    })

    it('The player should not be able to join if already playing', (done) => {
      client2.on('game:error', ({ message }) => {
        assert.ok(/already playing/.test(message))
        done()
      })

      client1.on('game:joined', () =>
        client2.emit('game:join', p1))

      client1.emit('game:join', p1)
    })

    it('The new player should be rejected if majority rules', (done) => {
      client2.on('room:error', ({ name }) => {
        assert.equal(name, 'Sorry')
        done()
      })

      client1.on('poll:new', ({ poll, message }) =>
        client1.emit('poll:vote', { poll, vote: false }))

      client1.on('game:joined', () =>
        client2.emit('game:join', p2))

      client1.emit('game:join', p1)
    })

    it('The new player should poll other players before joining', (done) => {
      client1.on('poll:new', ({ message }) => {
        assert.equal(message, `${p2.name.toUpperCase()} would like to join`)
        done()
      })

      client1.on('game:joined', () =>
        client2.emit('game:join', p2))

      client1.emit('game:join', p1)
    })

    it('The new player should successfully join', (done) => {
      client2.on('game:joined', () => done())

      client1.on('poll:new', ({ poll, message }) => {
        assert.equal(message, `${p2.name.toUpperCase()} would like to join`)
        client1.emit('poll:vote', { poll, vote: true })
      })

      client1.on('game:joined', () =>
        client2.emit('game:join', p2))

      client1.emit('game:join', p1)
    })

    it('The new player should recieve a notice once they join', (done) => {
      client1.on('game:joined', ({ game: { notice: { message }}}) => {
        assert.ok(message.includes(`{p:${p1.token}} joined`))
        done()
      })

      client1.emit('game:join', p1)
    })
  })

  describe('Game Actions', () => {

    beforeEach((done) => {
      client1.on('game:joined', () => done())
      client1.emit('game:join', p1)
    })

    const actions = {
      'game:pay-bank': { amount: 100 },
      'game:collect-money': { amount: 100 },
      'game:pay-player': { player: p2.token, amount: 100 },
      'game:pay-rent': { property: 'Oriental Avenue' },
      'game:claim-bankruptcy': { player: 'bank' },
      'game:buy-property': { property: 'Oriental Avenue' },
      'game:improve-property': { property: 'Oriental Avenue' },
      'game:unimprove-property': { property: 'Oriental Avenue' },
      'game:mortgage-property': { property: 'Oriental Avenue' },
      'game:unmortgage-property': { property: 'Oriental Avenue' },
      'auction:start': { property: 'Oriental Avenue' },
      'auction:bid': { property: 'Oriental Avenue' },
      'auction:concede': { property: 'Oriental Avenue' },
      'trade:offer': { player: p2.token, trade: [{ properties: ['Oriental Avenue'] }] },
      'trade:decline': { player: p2.token },
      'trade:accept': { player: p2.token }
    }

    for (const [event, data] of Object.entries(actions)) {
      it(`The room should respond to "${event}"`, (done) => {
        client1.on('game:update', () => done())
        client1.on('game:error', () => done())
        client1.emit(event, data)
      })
    }
  })

  describe('Polls', () => {

    it('The poll should expire after a timeout', (done) => {
      client1.on('poll:end', (pollID, result) => {
        assert.ok(!result)
        done()
      })

      client1.on('poll:new', ({ message }) =>
        assert.equal(message, `${p2.name.toUpperCase()} would like to join`))

      client1.on('game:joined', () =>
        client2.emit('game:join', p2))

      client1.emit('game:join', p1)
    })

    it('The poll should close after majority rules', (done) => {
      const p3 = { name: 'player 3', token: tokens[2] }
      const client3 = io.connect(config.uri, socketOpts)
      let pollID

      client1.on('poll:end', ({ poll, result }) => {
        if (pollID === poll) {
          assert.ok(result)
          done()
        }
      })

      client1.on('poll:new', ({ poll, message }) => {
        client1.emit('poll:vote', { poll, vote: true })

        if (message === `${p3.name.toUpperCase()} would like to join`) {
          pollID = poll
        }
      })

      client1.on('game:joined', () =>
        client2.emit('game:join', p2))

      client2.on('game:joined', () =>
        client3.emit('game:join', p3))

      client2.on('poll:new', ({ poll, message }) =>
        client2.emit('poll:vote', { poll, vote: true }))

      client3.on('room:connected', () =>
        client1.emit('game:join', p1))

      client3.emit('room:connect', { room })
    })
  })

  describe('Contesting', () => {
    let entryID

    beforeEach((done) => {
      client1.on('game:update', ({ game: { entry, notice } }) => {
        if (notice && notice.message === `{p:${p1.token}} purchased Oriental Avenue`) {
          entryID = entry
          done()
        }
      })

      client1.on('poll:new', ({ poll, message }) => {
        if (message === `${p2.name.toUpperCase()} would like to join`) {
          client1.emit('poll:vote', { poll, vote: true })
        }
      })

      client1.on('game:joined', ({ game }) =>
        client2.emit('game:join', p2))

      client2.on('game:joined', () =>
        client1.emit('game:buy-property', { property: 'Oriental Avenue' }))

      client1.emit('game:join', p1)
    })

    afterEach(() => {
      entryID = null
    })

    it('The room should poll other players to undo a specific action', (done) => {
      client1.on('poll:new', ({ poll, message }) => {
        assert.ok(message.includes(`{p:${p2.token}} is contesting`))
        done()
      })

      client2.emit('game:contest', { entry: entryID })
    })

    it('The room shouldn\'t poll if the last action was performed by the initiator', (done) => {
      client1.on('game:update', ({ game: { notice, properties } }) => {
        const property = properties.find((p) => p.name === 'Oriental Avenue')

        assert.ok(notice.message.includes('Game reset'))
        assert.equal(property.owner, 'bank')

        done()
      })

      client1.emit('game:contest', { entry: entryID })
    })

    it('The initiator should be notified when the vote is "no"', (done) => {
      let pollID

      client1.on('poll:end', ({ poll, result }) => {
        assert.equal(pollID, poll)
        assert.ok(!result)
        done()
      })

      client1.on('poll:new', ({ poll, message }) => {
        if (message.includes(`{p:${p2.token}} is contesting`)) {
          client1.emit('poll:vote', { poll, vote: false })
          pollID = poll
        }
      })

      client2.emit('game:contest', { entry: entryID })
    })

    it('The game state should be set to before the action was taken', (done) => {
      client1.on('game:update', ({ game: { notice, properties } }) => {
        const property = properties.find((p) => p.name === 'Oriental Avenue')

        assert.ok(notice.message.includes('Game reset'))
        assert.equal(property.owner, 'bank')

        done()
      })

      client1.on('poll:new', ({ poll, message }) => {
        if (message.includes(`{p:${p2.token}} is contesting`)) {
          client1.emit('poll:vote', { poll, vote: true })
        }
      })

      client2.emit('game:contest', { entry: entryID })
    })
  })

  describe('Messaging', () => {
    let player1, player2

    beforeEach((done) => {
      client2.on('game:joined', () => done())

      client1.on('poll:new', ({ poll, message }) => {
        if (message === `${p2.name.toUpperCase()} would like to join`) {
          client1.emit('poll:vote', { poll, vote: true })
        }
      })

      client1.on('game:joined', ({ player, game }) =>
        client2.emit('game:join', p2))

      client1.emit('game:join', p1)
    })

    it('The room should curry the message to another player', (done) => {
      client2.on('message:new', ({ player, message }) => {
        assert.equal(p1.token, player)
        assert.equal(message, 'Test Message')
        done()
      })

      client1.emit('message:send', {
        player: p2.token,
        message: 'Test Message'
      })
    })
  })
})
