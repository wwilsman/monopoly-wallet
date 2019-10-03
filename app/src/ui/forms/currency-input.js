import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { Currency } from '../typography';
import styles from './forms.css';

const cx = classNames.bind(styles);

CurrencyInput.propTypes = {
  value: PropTypes.number,
  defaultValue: PropTypes.number,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};

export default function CurrencyInput({
  value,
  defaultValue,
  label,
  onChange,
  onFocus,
  onBlur,
  ...props
}) {
  let handleChange = useCallback(({ target }) => {
    onChange(target.value ? parseInt(target.value, 10) : 0);
  }, [onChange]);

  return (
    <label
      className={cx('currency-input')}
      data-test-currency-input
    >
      {label && (
        <span className={cx('label')}>
          {label}
        </span>
      )}

      <input
        value={value || '0'}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        type="number"
      />

      <Currency
        value={value == null ? defaultValue : value}
        data-test-currency-value
        {...props}
      />
    </label>
  );
}
