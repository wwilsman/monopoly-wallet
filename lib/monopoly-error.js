// Monopoly Error Types
// ====================

// Used to create new Error subclasses
function CustomError(name, message) {
  function CustomError(str) {
    Error.call(this);
    Error.captureStackTrace(this, arguments.callee);
    this.message = message.replace(/%s/g, str);
    this.name = name;
  }

  CustomError.prototype = Object.create(Error.prototype);

  return CustomError;
}

// Create Custom Errors
// --------------------

// Base Error Class
MonopolyError = new CustomError('Error', '%s');

// Helper to create new error types
function createError(name, message) {
  MonopolyError[name] = new CustomError(name, message);
}

// Low Balance Error
createError('LowBalanceError', 'Your balance is too low');

// Owner Error
createError('OwnerError', 'You do not own %s');

// Improved Error
createError('ImprovementError', '%s has improvements');

// Fully Improved Error
createError('FullImprovementError', '%s is fully improved');

// Unimproved Error
createError('UnimprovementError', '%s is not yet improved');

// Build Evenly Error
createError('BuildEvenlyError', 'You must build evenly');

// Monopoly Error
createError('MonopolyError', '%s is not part of a monopoly');

// Mortgage Error
createError('MortgageError', '%s is mortgaged');

// Unmortgage Error
createError('UnmortgageError', '%s is not mortgaged');

// Availability Error
createError('AvailabilityError', 'There aren\'t enough %s');


module.exports = MonopolyError;