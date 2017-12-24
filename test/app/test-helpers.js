import Convergence, { convergeOn } from '@bigtest/convergence';

// handy exports
export const describe = window.describe;
export const beforeEach = window.beforeEach;
export const afterEach = window.afterEach;
export const before = window.before;
export const after = window.after;

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
 * Convergence creator
 * @returns {Convergence}
 */
export function converge() {
  let timeout = this && typeof this.timeout === 'function'
    ? this.timeout() : 2000;
  return new Convergence(timeout);
}

/**
 * A helper that returns a function that when called will use
 * `convergeOn` with the current context and any passed arguments
 * @returns {Function}
 */
export const convergent = (assertion, always) => function() {
  let timeout = this && typeof this.timeout === 'function'
    ? this.timeout() : 2000;
  return convergeOn.call(this, assertion, timeout, always);
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
 */
it.always = (name, assertion) => {
  return !assertion ? it.immediately(name) :
    it.immediately(name, convergent(assertion, true)).timeout(200);
};

/**
 * Inverted convergent it.only
 * @see it
 */
it.always.only = (name, assertion) => {
  return !assertion ? it.immediately.only(name) :
    it.immediately.only(name, convergent(assertion, true)).timeout(200);
};

/**
 * Pauses a test by returning a promise that never resolves
 * @see it
 */
it.pause = (name) => {
  return it.immediately(name, () => {
    return new Promise(() => {});
  }).timeout(0);
};

/**
 * Pauses a test by returning a promise that never resolves
 * @see it
 */
it.pause.only = (name) => {
  return it.immediately.only(name, () => {
    return new Promise(() => {});
  }).timeout(0);
};
