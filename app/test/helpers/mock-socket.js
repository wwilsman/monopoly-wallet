import { createTestingHook } from 'testing-hooks';
import { EventEmitter } from '../../src/helpers/emitter';

class Server extends EventEmitter {
  static list = Object.create(null);

  constructor(address) {
    super();

    if (Server.list[address]) {
      throw new Error(`WebSocket Server already listening on ${address}`);
    }

    Server.list[address] = this;
    this.clients = new Map();
    this.address = address;
    this._latency = 5;
  }

  latency(ms) {
    this._latency = ms ?? this._latency;
    return ms ? this : this._latency;
  }

  connect(ws) {
    let client = new Client(this, ws);
    this.clients.set(ws, client);

    setTimeout(() => {
      this.emit('connection', client);
    }, this.latency());

    return client;
  }

  disconnect(ws) {
    if (this.clients.has(ws)) {
      let client = this.clients.get(ws);
      client.emit('close').removeAllListeners();
      ws.emit('close').removeAllListeners();
      this.clients.delete(ws);
    }
  }

  close() {
    this.clients.forEach(c => c.terminate());
    delete Server.list[this.address];
  }
}

class Client extends EventEmitter {
  constructor(server, socket) {
    super();
    this.server = server;
    this.socket = socket;
  }

  send(data) {
    setTimeout(() => {
      this.socket.emit('message', { data });
    }, this.server.latency());
  }

  terminate() {
    this.socket.close();
  }
}

class WebSocket extends EventEmitter {
  constructor(address) {
    super();
    this.id = Date.now();
    this.address = address;

    setTimeout(() => {
      this.server = Server.list[this.address];
      this.client = this.server.connect(this);
    }, 1);
  }

  send(payload) {
    this.client?.emit('message', payload);
  }

  close() {
    this.server?.disconnect(this);
    delete this.server;
    delete this.client;
  }
}

WebSocket.Server = Server;

export default createTestingHook(() => {
  let og = window.WebSocket;
  window.WebSocket = WebSocket;

  return () => {
    window.WebSocket = og;
  };
});
