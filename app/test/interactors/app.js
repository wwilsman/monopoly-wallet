import interactor from 'interactor.js';
import percySnapshot from '@interactor/percy';

const { defineProperty } = Object;

@interactor class AppInteractor {
  static defaultPath = '/';

  static defineContext(get) {
    defineProperty(this.prototype, 'ctx', { get });
  }

  static defineRoom(get) {
    defineProperty(this.prototype, 'room', { get });
  }

  get ctx() {
    throw new Error('no app context');
  }

  get room() {
    throw new Error('no room context');
  }

  get state() {
    return this.ctx.store.getState();
  }

  get location() {
    return this.state.router.location.pathname;
  }

  visit(path = this.constructor.defaultPath) {
    return this.do(() => this.ctx.history.push(path));
  }

  goBack() {
    return this.do(() => this.ctx.history.goBack());
  }

  emit(event, ...args) {
    return this.do(() => {
      let ws = this.ctx.socket;

      window.setTimeout(() => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({ event, args }));
        }
      }, 1);
    });
  }

  delaySocket(ms) {
    return this.do(() => {
      this.ctx.socket.client.delay(ms);
    });
  }

  percySnapshot(name) {
    let title = this.constructor.snapshotTitle;
    name = name ? `${title} - ${name}` : title;

    return percySnapshot(name, {
      widths: [375],
      minHeight: 812
    });
  }
}

export default AppInteractor;
