import { meta } from './helpers';

const { assign } = Object;

// a monopoly error consists of a message identifier and meta to format the
// corresponding message
export function MonopolyError(id, meta = {}) {
  this.name = 'MonopolyError';
  this.id = id;
  this.meta = meta;

  // the stack trace is still useful when debugging
  Error.captureStackTrace(this, MonopolyError);
}

// Errors need to be extended the old fashioned way
MonopolyError.prototype = assign(new Error(), {
  // creates the error message using a formatter
  format(formatter) {
    this.message = formatter
      ? formatter(`error.${this.id}`, this.meta)
      : this.id;
  }
});

// helper to avoid `new MonopolyError` boilerplate
export function error(id, meta) {
  return new MonopolyError(id, meta);
}

// state reducer creator that catches monopoly errors to provide computed meta
// information for message formatting later
export function withError(validate) {
  return state => {
    try {
      validate(state);
    } catch (error) {
      // compute meta information for monopoly errors
      if (error instanceof MonopolyError) {
        error.meta = meta(state, error.meta);
      }

      // rethrow all errors
      throw error;
    }

    // validators never modify the state
    return state;
  };
}
