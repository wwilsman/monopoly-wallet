import $ from 'jquery';

export function click(selector) {
  const node = $(selector).get(0);
  node && node.click();
}

export function fill(selector, value) {
  $(selector).val(value)
    .each((i, el) => triggerChange(el));
}

function triggerChange(node) {
  const initialValue = node.value;

  // cache artificial value property descriptor.
  const descriptor = Object.getOwnPropertyDescriptor(node, 'value');

  // update inputValueTracking cached value
  node.value = initialValue + '#';

  // remove artificial value property
  delete node.value;

  // restore initial value to trigger event with it
  node.value = initialValue;

  // dispatch input event
  const event = document.createEvent('HTMLEvents');
  event.initEvent('input', true, false);
  node.dispatchEvent(event);

  // restore artificial value property descriptor
  if (descriptor) {
    Object.defineProperty(node, 'value', descriptor);
  }
}
