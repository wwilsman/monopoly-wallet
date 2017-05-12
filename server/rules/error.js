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

/**
 * Helper function to throw a new MonopolyError
 * @param {String} message - Error message
 * @throws {MonopolyError}
 */
export const throwError = (message) => {
  throw new MonopolyError(message);
};
