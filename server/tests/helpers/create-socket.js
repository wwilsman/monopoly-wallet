import EventEmitter from 'events';
import WebSocket from 'ws';

const { isArray } = Array;

// create a websocket that emits events to the returned emitter
export default async function createSocket(initevents = []) {
  let socket = new WebSocket('ws://localhost:8080');
  let emitter = new EventEmitter();
  let sent = Object.create(null);
  let timeout = 100;

  let cleanup = event => {
    clearTimeout(sent[event]?._timeout);
    delete sent[event];
  };

  socket.on('message', payload => {
    let { event, args } = JSON.parse(payload);
    emitter.emit(event, ...args);
  });

  emitter.expect = event => new Promise((resolve, reject) => {
    let _timeout = setTimeout(() => {
      reject(new Error(`"${event}" no response after ${timeout}ms`));
      emitter.off(event, handle);
    }, timeout);

    let handle = (...args) => {
      clearTimeout(_timeout);
      resolve(args);
    };

    emitter.once(event, handle);
  });

  emitter.send = (event, ...args) => (
    new Promise((resolve, reject) => {
      let _timeout = setTimeout(() => {
        reject(new Error(`"${event}" no response after ${timeout}ms`));
        cleanup(event);
      }, timeout);

      sent[event] = { resolve, reject, _timeout };
      socket.send(JSON.stringify({ event, args }));
    })
  );

  emitter.timeout = ms => {
    return (timeout = ms || timeout);
  };

  emitter.on('response:ok', (event, ...args) => {
    sent[event]?.resolve(args);
    cleanup(event);
  });

  emitter.on('response:error', (event, error) => {
    sent[event]?.reject(new Error(error.message));
    cleanup(event);
  });

  await initevents.reduce((promise, [event, ...args]) => (
    promise.then(() => emitter.send(event, ...args))
  ), emitter.expect('connected'));

  return emitter;
}
