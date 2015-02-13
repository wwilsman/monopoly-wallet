var MonopolyError = require('./error');

// Monopoly Error Assertion
// ====================

module.exports = function(error, condition, string) {
  
  // **condition** is true
  if (condition) {

    // Error subclass exists
    if (MonopolyError[error]) {
      throw new MonopolyError[error](string);

    // Throw general error
    } else {
      throw new MonopolyError(error.replace(/%s/g, string));
    }
  }
};
