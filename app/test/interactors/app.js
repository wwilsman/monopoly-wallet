import interactor, { Interactor, when } from 'interactor.js';
import percySnapshot from '@interactor/percy';
import { act } from 'react-dom/test-utils';

const { defineProperty } = Object;

class ReactInteractor extends Interactor {
  do(callback) {
    return super.do(function() {
      return act(async () => callback.apply(this, arguments));
    });
  }
}

@interactor class AppInteractor extends ReactInteractor {
  static defaultPath = '/';

  static defineContext(get) {
    defineProperty(this.prototype, 'ctx', { get });
  }

  get ctx() {
    throw new Error('App context is not defined');
  }

  get state() {
    return this.ctx.state;
  }

  get history() {
    return this.ctx.history;
  }

  get location() {
    return this.history.location.pathname;
  }

  visit(path = this.constructor.defaultPath) {
    return this.do(() => this.history.push(path));
  }

  goBack() {
    return this.do(() => this.history.goBack());
  }

  async get(path) {
    let { value } = await when(() => (
      path.split('.').reduce((parent, key) => parent?.[key], this)
    ) ?? false);

    return value;
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
