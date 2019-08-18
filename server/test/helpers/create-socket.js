import { createPlayerEmitter } from 'app/src/helpers/emitter';

// create a websocket that emits events to the returned emitter
export default async function createTestSocket(socket, initevents = []) {
  let emitter = createPlayerEmitter(socket);
  emitter.timeout(100);

  let send = emitter.send;
  emitter.send = (...args) => {
    return send(...args).catch(({ message }) => {
      throw new Error(message);
    });
  };

  emitter.expect = event => {
    return new Promise((resolve, reject) => {
      let _timeout = setTimeout(() => {
        reject(new Error(`"${event}" no response after ${emitter.timeout()}ms`));
        emitter.off(event, handle);
      }, emitter.timeout());

      let handle = (...args) => {
        emitter.off(event, handle);
        clearTimeout(_timeout);
        resolve(args);
      };

      emitter.on(event, handle);
    });
  };

  await initevents.reduce((promise, [event, ...args]) => (
    promise.then(() => emitter.send(event, ...args))
  ), emitter.expect('connected'));

  return emitter;
}
