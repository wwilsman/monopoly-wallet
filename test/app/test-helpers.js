// handy exports
export const describe = window.describe;
export const beforeEach = window.beforeEach;
export const afterEach = window.afterEach;
export const before = window.before;
export const after = window.after;

/**
 * Pauses a test by removing the timeout and returning a promise that
 * will never resolve.
 *
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
 *
 * @param {function} push - function to push  the current history
 * @param {mixed} path - the argument provided to `push`
 * @param {function} assertion - the assertion to converge on
 */
export function visit(push, path, assertion) {
  push(path);
  if (assertion) {
    return convergeOn.call(this, assertion);
  }
}

/**
 * Emits an event on behalf of the socket after 1ms to ensure other
 * events have been received first
 *
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
 * Creates a promise that will only resolve once a give condition has
 * been met. After a given timeout, if the `assertion` still does not
 * pass, the promise will be rejected.
 *
 * By default, `convergeOn` checks that an assertion passes at least
 * once during the timeout window. Sometimes however, you want to
 * check the opposite: not that something has changed, but that
 * something remains constant. In that case you want to set `invert`
 * to true, and it will only resolve if the `assertion` is true for
 * the entire timeout period, and reject when the `assertion` fails.
 *
 * @param {function} assertion - run to test condition repeatedly
 * @param {boolean} invert - if true, makes sure assertion passes throughout the entire timeout
 * @param {number} time - timeout in milliseconds to check the assertion
 * @returns {Promise} resolves according to the above
 */
export function convergeOn(assertion, invert, time) {
  const test = this;
  const start = Date.now();
  const timeout = time || (test ? test.timeout() : 2000);
  const interval = 10;

  return new Promise((resolve, reject) => {
    (function loop() {
      const ellapsed = Date.now() - start;
      const doLoop = ellapsed + interval < timeout;

      try {
        const ret = assertion.call(test);

        if (invert && doLoop) {
          window.setTimeout(loop, interval);
        } else if (ret && typeof ret.then === 'function') {
          ret.then(resolve);
        } else {
          resolve();
        }
      } catch(error) {
        if (!invert && doLoop) {
          window.setTimeout(loop, interval);
        } else if (invert || !doLoop) {
          reject(error);
        }
      }
    })();
  });
}

/**
 * A helper that returns a function that when called will use
 * `convergeOn` with the current context and any passed arguments
 * @returns {Function}
 */
const convergent = (...args) => function() {
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
