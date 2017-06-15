/**
 * MonopolyError class
 * @param {String} message - Error message
 */
export default class MonopolyError {
  constructor(message) {
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toString() {
    return `${this.name}: ${this.message}`;
  }
}
