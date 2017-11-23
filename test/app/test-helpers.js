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
 * @param {function} [assertion] - the assertion to converge on
 */
export function visit(push, path, assertion = () => {}) {
  push(path);

  return convergeOn.call(this, assertion);
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
  let start = convergeOn._start = convergeOn._start || Date.now();
  let timeout = time || (this ? this.timeout() : 2000);
  let interval = 10;
  let context = this;

  // cleanup when all convergences are done after the interval
  let done = () => {
    convergeOn._length -= 1;

    setTimeout(() => {
      if (!convergeOn._length) {
        delete convergeOn._start;
        delete convergeOn._length;
      }
    }, interval);
  };

  return new Promise((resolve, reject) => {
    // keep track of all convergences
    convergeOn._length = (convergeOn._length || 0) + 1;

    // do the actual loop
    (function loop() {
      let ellapsed = Date.now() - start;
      let doLoop = ellapsed + interval < timeout;

      try {
        let ret = assertion.call(context);

        if (invert && doLoop) {
          window.setTimeout(loop, interval);
        } else {
          done();
          resolve(ret);
        }
      } catch(error) {
        if (!invert && doLoop) {
          window.setTimeout(loop, interval);
        } else if (invert || !doLoop) {
          done();
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
