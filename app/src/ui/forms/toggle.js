import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './forms.css';

const cx = classNames.bind(styles);

Toggle.propTypes = {
  active: PropTypes.bool.isRequired,
  colorActive: PropTypes.oneOf(['primary', 'secondary', 'alert']),
  colorInactive: PropTypes.oneOf(['primary', 'secondary', 'alert']),
  onChange: PropTypes.func.isRequired
};

export default function Toggle({
  active,
  colorActive,
  colorInactive,
  onChange
}) {
  let color = active ? colorActive : colorInactive;

  return (
    <label
      data-test-checkbox
      className={styles.checkbox}
    >
      <input
        type="checkbox"
        checked={active}
        onChange={onChange}
      />

      <div className={cx('toggle', {
        'is-active': active,
        [`color--${color}`]: !!color
      })}/>
    </label>
  );
}
