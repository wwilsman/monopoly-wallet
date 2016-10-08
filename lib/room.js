import MonopolyGame from './game'

export default class MonopolyRoom {

  // All rooms
  static rooms = {};

  // Join room
  static joinRoom(game, socket, data) {
    let room = this.rooms[game._id]

    if (!room) {
      room = new MonopolyRoom(game)
      this.rooms[game._id] = room
    }

    room.join(socket, data)
  }

  // Setup room
  constructor(game) {
    this.game = new MonopolyGame(game)
  }

  // Destroy room
  destroy() {
    delete this.constructor.rooms[this.game.state._id]
  }

  // Join game
  join(socket, data) {

  }
}
