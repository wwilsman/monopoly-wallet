import Interactor, {
  assertion,
  blur,
  checked,
  disabled,
  focus,
  exists,
  matches,
  text,
  type,
  value,
  when
} from 'interactor.js';

import FormStyles from '../../src/ui/forms/forms.css';

function get(obj, path) {
  return path ? path.split('.').reduce((s, k) => s[k], obj) : obj;
}

export const Root = Interactor.extend({
  pathname: '/'
}, {
  get context() {
    return Root.context;
  },

  get grm() {
    return this.context.grm;
  },

  get socket() {
    return this.context.socket;
  },

  get location() {
    return this.context.history.location.pathname;
  },

  visit(path = this.constructor.path) {
    return this.exec(() => this.context.history.push(path));
  },

  goBack() {
    return this.exec(() => this.context.history.back());
  },

  state: {
    value(path) {
      return get(this.context.state, path);
    }
  },

  localstorage: {
    value(path) {
      return get(this.context.ls.data, path);
    }
  },

  get(path) {
    return when(() => {
      let value = this.state(path);

      if (value == null) {
        throw Interactor.error(`%{@} ${path} is ${value}`);
      }

      return value;
    });
  },

  mock({ localstorage, ...game }) {
    return this.exec(async () => {
      if (localstorage) {
        Object.assign(this.localstorage(), localstorage);
      }

      if (Object.keys(game).length) {
        await this.grm.mock(game);
      }
    });
  },

  exists: {
    assert: assertion(function() {
      let screen = this.constructor.screen;

      return {
        message: `the ${screen} screen %{- does not exist|exists}`,
        result: this.find(`[data-test-${screen}]`).exists
      };
    })
  },

  loading: exists('[data-test-spinner]'),
  backButton: Interactor('[data-test-back]'),
  roomCode: text('[data-test-room-code]')
});

export const Input = Interactor.extend({
  label: text('[data-test-label]'),
  disabled: disabled('[data-test-input]'),
  type: str => type('[data-test-input]', str),
  focus: () => focus('[data-test-input]'),
  blur: () => blur('[data-test-input]'),
  value: value('[data-test-input]'),
  error: text('[data-test-error]')
});

export const RadioGroup = Interactor.extend({
  disabled: matches(`.${FormStyles['is-disabled']}`),
  item: Interactor.extend({
    selector: name => name
      ? `[data-test-radio-item="${name}"]`
      : '[data-test-radio-item]'
  }, {
    disabled: disabled('input[type="radio"]'),
    selected: checked('input[type="radio"]')
  })
});
