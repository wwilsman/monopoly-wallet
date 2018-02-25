/**
 * MonopolyError
 * @param {String} message - Error message
 */
function MonopolyError(message) {
  this.name = 'MonopolyError';
  this.message = message;

  Error.captureStackTrace(this, MonopolyError);
}

MonopolyError.prototype = new Error;

export default MonopolyError;
