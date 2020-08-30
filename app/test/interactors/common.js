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

export const Root = Interactor.extend({
  pathname: '/'
}, {
  get context() {
    return Root.context;
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
      return path ? path.split('.').reduce(
        (state, key) => state[key],
        this.context.state
      ) : this.context.state;
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
