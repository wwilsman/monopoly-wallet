import { MonopolyError } from './error';

// a player is a thin wrapper around a websocket where messages are converted
// into events and responses are sent on reception of valid events
export default class Player {
  constructor(socket, manager) {
    this.manager = manager;
    this.socket = socket;

    // used to track events
    this.events = Object.create(null);

    // parse payloads and pass to the handleEvent method
    socket.on('message', payload => {
      let { event, args } = JSON.parse(payload);
      this.handleEvent(event, ...args);
    });

    // on close, disconnect this socket from the manager
    socket.on('close', () => {
      manager.disconnect(this);
    });

    // on fatal errors, terminate the socket
    socket.on('error', () => {
      socket.terminate();
    });
  }

  // only a single callback can be registered per event
  on(event, callback) {
    this.events[event] = callback;
  }

  // sends an event as a common payload to the websocket
  send(event, ...args) {
    this.socket.send(JSON.stringify({ event, args }));
  }

  // broadcast an event to all _other_ players in the room
  broadcast(event, ...args) {
    this.room.broadcast({ event, ignore: this }, ...args);
  }

  // return the room this player may be connected to
  get room() {
    return this.manager.players.get(this);
  }

  // return the token associated with this player
  get token() {
    return this.room?.players.get(this);
  }

  // if an event is registered, triggers it and responds
  async handleEvent(event, ...args) {
    if (this.events[event]) {
      try {
        // on success, send the response
        let response = await this.events[event](...args);
        // event is used to tell the websocket what the response is to
        this.send('response:ok', event, response);

      } catch (error) {
        // if the error is a monopoly error, the message is derived by
        // formatting the error's id using the room's format method
        if (error instanceof MonopolyError) {
          error.format(this.room?.format);
        }

        // respond to the event with the error name and message
        let { id, name, message } = error;
        let payload = { id, name, message };

        // useful for debugging
        if (process.env.NODE_ENV !== 'production' && !(error instanceof MonopolyError)) {
          payload.stack = error.stack;
        }

        this.send('response:error', event, payload);
      }
    }
  }
}
