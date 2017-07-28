import $ from 'jquery';
import triggerChange from 'react-trigger-change';

export function click(selector) {
  $(selector).get(0).click();
}

export function clickable(selector) {
  return () => click(selector);
}

export function fill(selector, value) {
  $(selector).val(value).each(triggerChange);
}

export function fillable(selector) {
  return (value) => fill(selector, value);
}
