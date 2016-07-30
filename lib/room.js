import { dasherize } from './helpers'
import MonopolyGame from './game'

class MonopolyRoom {

  // Setup room
  constructor(game, io, opts) {

    this.io = io
    this.teardown = opt.teardown

    this.game = new MonopolyGame(game)
  }
}

export default function(db, io) {
  let games = db.collection('games')
  let rooms = {}

  return {
    join(gameID, socket, data) {
      games.findOne({ _id: gameID }, (err, game) => {
        if (err || !game) {
          socket.emit('message', 'error', err ? err.message : 'Game not found')
          return
        }

        let room = rooms[gameID]

        if (!room) {
          room = new MonopolyRoom(game, io, {
            teardown: () => delete rooms[gameID]
          })

          rooms[gameID] = room
        }

        room.join(socket, data)
      })
    }
  }
}
