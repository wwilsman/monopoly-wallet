import $ from 'jquery';
import { expect } from 'chai';
import { convergeOn, convergent } from '../test-helpers';

/**
 * A convergent helper for selecting an element using jQuery and
 * ensuring that the element exists in the DOM
 * @param {String} selector - jQuery selector
 * @returns {Promise} a converging promise
 */
export function select(selector) {
  return convergeOn(() => {
    let $node = $(selector);
    expect($node).to.exist;
    return $node;
  });
}

/**
 * A convergent click helper that waits for the element to exist and,
 * by default, asserts that the element was clicked
 * @param {String} selector - jQuery selector
 * @param {Function} [assertion] - convergent assertion
 * @returns {Promise} a converging promise
 */
export function click(selector, assertion) {
  // used for the default assertion
  let clicked = false;
  let useDefault = !assertion;

  if (useDefault) {
    assertion = () => {
      expect(clicked, `unable to click ${selector}`).to.be.true;
    };
  }

  return select(selector).then(($node) => {
    if (useDefault) {
      $node.one('click', () => clicked = true);
    }

    $node.get(0).click();
  }).then(convergent(assertion));
}

/**
 * A convergent fill helper that waits for the input to exist and,
 * by default, asserts that the value of the input has changed
 * @param {String} selector - jQuery selector
 * @param {String} value - value to fill
 * @param {Function} [assertion] - convergent assertion
 * @returns {Promise} a converging promise
 */
export function fill(selector, value, assertion) {
  if (!assertion) {
    assertion = () => {
      // we don't care about the case
      let val = ($(selector).val() || '').toLowerCase();
      expect(val).to.equal(value.toLowerCase());
    };
  }

  return select(selector).then(($input) => {
    $input.val(value).each((i, el) => {
      triggerChange(el);
    });
  }).then(convergent(assertion));
}

/**
 * Helper to trigger a react change event
 *
 * Works by caching react's custom value property descriptor and
 * reapplying it after an input event is dispatched on the node
 *
 * @param {Node} node - a DOM API Node object
 */
function triggerChange(node) {
  const initialValue = node.value;

  // cache artificial value property descriptor
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
