/**
 * This tiny event emitter simply allows adding, removing, and
 * triggering events with arbitrary names and arguments.
 */
class EventEmitter {
  handlers = {};

  /**
   * Alias for `addEventListener`
   */
  on(event, fn) {
    this.addEventListener(event, fn);
  }

  /**
   * Adds a callback to an event's handlers
   * @param {String} event - event name
   * @param {Function} fn - event callback
   */
  addEventListener(event, fn) {
    this.handlers[event] = this.handlers[event] || [];
    this.handlers[event].push(fn);
  }

  /**
   * Removes a callback from an event's handlers. If no callback
   * function is provided, all event handlers will be removed.
   * @param {String} event - event name
   * @param {Function} [fn] - event callback
   */
  removeEventListener(event, fn) {
    if (this.handlers[event] && fn) {
      let i = this.handlers[event].indexOf(fn);

      if (i > -1) {
        this.handlers[event].splice(i, 1);
      }
    } else if (event) {
      this.handlers[event] = [];
    }
  }

  /**
   * Clears all handlers for all events
   */
  removeAllListeners() {
    this.handlers = {};
  }

  /**
   * Triggers an event with arbitrary arguments
   * @param {String} event - event name
   * @param {Mixed} [args] - arguments to trigger the handlers with
   */
  trigger(event, ...args) {
    if (this.handlers[event]) {
      this.handlers[event].forEach((fn) => {
        fn.apply(this, args);
      });
    }
  }
}

/**
 * A mock WebSocket server that simply brokers connections between
 * mock sockets (client side) and mock clients (server side)
 */
export class Server extends EventEmitter {
  static list = {};
  clients = [];

  /**
   * @constructor
   * @param {String} address - address for the mock server
   * @throws {Error} if another server is already listening at the address
   */
  constructor(address) {
    super();

    if (Server.list[address]) {
      throw new Error(`WebSocket Server already listening on ${address}`);
    }

    Server.list[address] = this;
    this.address = address;
  }

  /**
   * Connects a WebSocket with a new client
   * @param {WebSocket} ws - mock WebSocket instance
   */
  connect(ws) {
    let client = new Client(ws, this);
    this.clients.push(client);
    this.trigger('connection', client);
  }

  /**
   * Disconnects a WebSocket by removing all listeners and removing
   * the client
   * @param {WebSocket} ws - mock WebSocket instance
   */
  disconnect(ws) {
    let client = this.clients.find((c) => c.ws === ws);
    let i = this.clients.indexOf(client);

    if (client && i > -1) {
      client.removeAllListeners();
      this.clients.splice(i, 1);
    }
  }

  /**
   * Closes the server by terminating each connected client
   */
  close() {
    this.clients.forEach((c) => c.terminate());
    delete Server.list[this.address];
  }
}

/**
 * The mock server client used for communicating with a
 * mock WebSocket
 */
class Client extends EventEmitter {
  readyState = 1;

  /**
   * @constructor
   * @param {WebSocket} ws - mock WebSocket instance
   * @param {Server} server - mock Server instance
   */
  constructor(ws, server) {
    super();
    this.ws = ws;
    this.server = server;
  }

  /**
   * Sends data to the mock WebSocket via a `data` property of the
   * mocked event. (This is the only event prop used in our app)
   * @param {String} data - data to send to the mock WebSocket
   */
  send(data) {
    this.ws.trigger('message', { data });
  }

  /**
   * Disconnects the mock WebSocket instance from the mock Server
   */
  terminate() {
    this.readyState = 2;
    this.server.disconnect(this.ws);
    this.readyState = 3;
    this.ws.trigger('disconnect');
  }
}

/**
 * The mock WebSocket class for interacting with the mock Server
 */
export default class WebSocket extends EventEmitter {
  /**
   * @constructor
   * @param {String} address - address used for the mock Server
   */
  constructor(address) {
    super();
    this.id = Date.now();
    this.address = address;
    // allow events to be registered prior to connecting
    window.setTimeout(() => {
      this.open();
    }, 1);
  }

  /**
   * @returns {Server} the connected mock Server
   */
  get server() {
    return Server.list[this.address];
  }

  /**
   * @returns {Client} the connected client
   */
  get client() {
    if (this.server) {
      return this.server.clients.find((c) => (
        c.ws === this
      ));
    }
  }

  /**
   * Connects to a mock Server with the same address as this mock
   * WebSocket. If there is no server available, keep trying
   */
  open() {
    this.readyState = 0;

    if (this.server) {
      this.server.connect(this);
      this.on('disconnect', () => this.open());
      this.readyState = 1;
    } else {
      window.setTimeout(() => {
        this.open();
      }, 10);
    }
  }

  /**
   * Disconnects from the mock Server
   */
  close() {
    if (this.server) {
      this.readyState = 2;
      this.server.disconnect(this);
      this.readyState = 3;
      this.trigger('close');
    }
  }

  /**
   * Sends a payload to the client responsible for this WebSocket
   * @param {String} payload - payload to send the client
   */
  send(payload) {
    if (this.client) {
      this.client.trigger('message', payload);
    }
  }
}

// We only export the WebSocket class, but the Server and Client
// are available as static properties
WebSocket.Server = Server;
Server.Client = Client;
