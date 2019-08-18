const { assign } = Object;

export class EventEmitter {
  id = Date.now();
  listeners = Object.create(null);

  on = this.addEventListener;
  off = this.removeEventListener;

  addEventListener(event, fn) {
    this.listeners[event] = (this.listeners[event] || []).concat(fn);
    return this;
  }

  removeEventListener(event, fn) {
    this.listeners[event] = fn ? this.listeners[event]?.filter(f => f !== fn) : [];
    return this;
  }

  once(event, fn) {
    return this.addEventListener(event, function listener(...args) {
      fn.apply(this, args);
      this.removeEventListener(event, listener);
    });
  }

  removeAllListeners() {
    this.listeners = Object.create(null);
    return this;
  }

  emit(event, ...args) {
    this.listeners[event]?.forEach(fn => fn.apply(this, args));
    return this;
  }
}

export function createPlayerEmitter(
  socket = new WebSocket(`ws://${window.location.host}`)
) {
  let emitter = new EventEmitter();
  let tracked = Object.create(null);
  let timeout = 10000;

  socket.addEventListener('message', ({ data }) => {
    let { event, args } = JSON.parse(data);

    if (event === 'response:error') {
      clearTimeout(tracked[args[0]]?._timeout);
      tracked[args[0]]?.reject(args[1]);
      delete tracked[args[0]];
    } else if (event === 'response:ok') {
      clearTimeout(tracked[args[0]]?._timeout);
      tracked[args[0]]?.resolve(args.slice(1));
      delete tracked[args[0]];
    }

    if (process.env.NODE_ENV === 'development') {
      /* eslint-disable no-console */
      console.group(`recieved "${event}"`);
      args.forEach(a => console.log(a));
      console.groupEnd();
      /* eslint-enable no-console */
    }

    emitter.emit(event, ...args);
  });

  socket.addEventListener('close', () => {
    emitter.emit('close');
    emitter.removeAllListeners();
    tracked = Object.create(null);
  });

  return assign(emitter, {
    timeout: ms => {
      timeout = ms ?? timeout;
      return ms ? emitter : timeout;
    },

    send: (event, ...args) => {
      return new Promise((resolve, reject) => {
        let _timeout = setTimeout(() => {
          reject(new Error(`"${event}" no response after ${timeout}ms`));
          delete tracked[event];
        }, timeout);

        if (process.env.NODE_ENV === 'development') {
          /* eslint-disable no-console */
          console.group(`sent "${event}"`);
          args.forEach(a => console.log(a));
          console.groupEnd();
          /* eslint-enable no-console */
        }

        tracked[event] = { resolve, reject, _timeout };
        socket.send(JSON.stringify({ event, args }));
      });
    },

    disconnect: () => {
      socket.close();
    }
  });
}
