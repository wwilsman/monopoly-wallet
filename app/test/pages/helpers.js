import { Interaction } from '@bigtest/interaction';

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
