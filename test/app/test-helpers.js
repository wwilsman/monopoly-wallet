import { convergeOn } from '@bigtest/convergence';
export { convergeOn };

// handy exports
export const describe = window.describe;
export const beforeEach = window.beforeEach;
export const afterEach = window.afterEach;
export const before = window.before;
export const after = window.after;

/**
 * Pauses a test by removing the timeout and returning a promise that
 * will never resolve.
 * @returns {Promise} a promise that will never resolve
 */
export function pauseTest() {
  if (typeof this.timeout === 'function') {
    this.timeout(0);
  }

  return new Promise(() => {});
}

/**
 * Visits a path using the provided push function and returns a
 * convergent assertion
 * @param {Function} push - function to push the current history
 * @param {Mixed} path - the argument provided to `push`
 * @param {Function} [assertion] - the assertion to converge on
 * @returns {Promise} a convergent assertion
 */
export function visit(push, path, assertion = () => {}) {
  push(path);
  return convergeOn.call(this, assertion);
}

/**
 * Navigates backwards by calling the provided goBack function and
 * returns a convergent assertion
 * @param {Function} goBack - function to go back in the current history
 * @param {Function} [assertion] - the assertion to converge on
 * @returns {Promise} a convergent assertion
 */
export function goBack(goBack, assertion = () => {}) {
  goBack();
  return convergeOn.call(this, assertion);
}

/**
 * Emits an event on behalf of the socket after 1ms to ensure other
 * events have been received first
 * @param {WebSocket} ws - WebSocket instance
 * @param {String} event - event name
 * @param {Mixed} ...args - arguments to emit
 */
export function emit(ws, event, ...args) {
  window.setTimeout(() => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ event, args }));
    }
  }, 1);
}

/**
 * A helper that returns a function that when called will use
 * `convergeOn` with the current context and any passed arguments
 * @returns {Function}
 */
export const convergent = (...args) => function() {
  return convergeOn.apply(this, args);
};

/**
 * Convergent it
 * @param {String} name - name of the test
 * @param {Function} assertion - test assertions
 */
export function it(name, assertion) {
  return !assertion ? it.immediately(name) :
    it.immediately(name, convergent(assertion));
}

/**
 * Original it
 */
it.immediately = window.it;
it.skip = it.immediately.skip;

/**
 * Convergent it.only
 * @see it
 */
it.only = (name, assertion) => {
  return !assertion ? it.immediately.only(name) :
    it.immediately.only(name, convergent(assertion));
};

/**
 * Inverted convergent it
 * @see it
 * @param {Number} time - timeout in milliseconds
 */
it.still = (name, assertion, time = 200) => {
  return !assertion ? it.immediately(name) :
    it.immediately(name, convergent(assertion, true, time));
};
