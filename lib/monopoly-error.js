// Monopoly Error
// ==============

function MonopolyError(name, message) {
  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);
  this.name = name;
}

MonopolyError.prototype = Object.create(Error.prototype);

module.exports = MonopolyError;
