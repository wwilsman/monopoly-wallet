import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './forms.css';
import { Text } from '../typography';

const cx = classNames.bind(styles);

Toggle.propTypes = {
  active: PropTypes.bool.isRequired,
  labelActive: PropTypes.string,
  labelInactive: PropTypes.string,
  colorActive: PropTypes.oneOf(['primary', 'secondary', 'alert']),
  colorInactive: PropTypes.oneOf(['primary', 'secondary', 'alert']),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default function Toggle({
  active,
  labelActive,
  labelInactive,
  colorActive,
  colorInactive,
  disabled,
  onChange
}) {
  let color = active ? colorActive : colorInactive;

  return (
    <label
      className={cx('checkbox', 'toggle', {
        'is-active': active,
        'is-disabled': disabled
      })}
      data-test-toggle
    >
      <input
        type="checkbox"
        checked={active}
        onChange={onChange}
        disabled={disabled}
      />

      {labelInactive && (
        <Text color={active ? undefined : colorInactive} upper sm>
          {labelInactive}
        </Text>
      )}

      <div className={cx('inline-toggle', {
        [`color--${color}`]: !!color
      })}/>

      {labelActive && (
        <Text color={active ? colorActive : undefined} upper sm>
          {labelActive}
        </Text>
      )}
    </label>
  );
}
