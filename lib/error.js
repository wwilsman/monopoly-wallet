// Monopoly Error
// ==============

export default class MonopolyError extends Error {

  constructor(message) {
    super(message)
    this.name = 'MonopolyError'
    this.message = message
  }
}
