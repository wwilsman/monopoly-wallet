import interactor from 'interactor.js';

@interactor class AppInteractor {
  static defaultPath = '/';

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
}

export default AppInteractor;
