import { createTestingHook } from 'testing-hooks';

const {
  defineProperty,
  getOwnPropertyDescriptor
} = Object;

export default createTestingHook(context => {
  let og = getOwnPropertyDescriptor(window, 'localStorage');

  context.ls = {
    data: {},
    setItem(key, string) {
      this.data[key] = JSON.parse(string);
    },
    getItem(key) {
      return JSON.stringify(this.data[key]);
    }
  };

  defineProperty(window, 'localStorage', { value: context.ls });

  return () => {
    delete context.ls;
    defineProperty(window, 'localStorage', og);
  };
});
