import $ from 'jquery';
import { expect } from 'chai';
import Convergence from '@bigtest/convergence';

/**
 * Interaction class to perform multiple interactions with the DOM
 * within one convergence period
 */
export class Interaction {
  /**
   * @constructor
   * @param {Convergence} convergence - the convergence to start with
   */
  constructor(convergence = new Convergence()) {
    Object.defineProperty(this, 'convergence', {
      value: convergence
    });
  }

  /**
   * @see Convergence.once
   */
  once(assert) {
    return new Interaction(
      this.convergence.once(assert)
    );
  }

  /**
   * @see Convergence.do
   */
  do(exec) {
    return new Interaction(
      this.convergence.do(exec)
    );
  }

  /**
   * Adds a convergence for an element existing in the DOM
   * @param {String} selector - jQuery selector
   * @returns {Interaction}
   */
  select(selector) {
    return new Interaction(
      this.convergence.once(() => {
        let $node = $(selector);
        expect($node).to.exist;
        return $node;
      })
    );
  }

  /**
   * Adds a convergence that clicks an element when it exists
   * @param {String} selector - jQuery selector
   * @returns {Interaction}
   */
  click(selector) {
    return this.select(selector)
      .do(($node) => {
        $node.get(0).click();
      });
  }

  /**
   * Adds a convergence that fills an input when it exists
   * @param {String} selector - jQuery selector
   * @param {String} value - desired input value
   * @returns {Interaction}
   */
  fill(selector, value) {
    return this.select(selector)
      .do(($node) => {
        $node.val(value).each((i, el) => {
          triggerChange(el);
        });
      });
  }

  /**
   * @see Convergence.run
   */
  run() {
    return this.convergence.run();
  }
}

/**
 * Helper to return an converging promise that clicks an element and
 * asserts something before converging
 * @param {String} selector - jQuery selector
 * @param {Function} assertion - converging assertion
 * @returns {Promise} converging promise
 */
export function click(selector, assertion) {
  return new Interaction()
    .click(selector)
    .once(assertion)
    .run();
}


/**
 * Helper to return an converging promise that fills an input and
 * asserts something before converging
 * @param {String} selector - jQuery selector
 * @param {String} value - desired input value
 * @param {Function} assertion - converging assertion
 * @returns {Promise} converging promise
 */
export function fill(selector, value, assertion) {
  return new Interaction()
    .fill(selector, value)
    .once(assertion)
    .run();
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
