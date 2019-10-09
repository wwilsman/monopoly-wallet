import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { Currency } from '../typography';
import BigInput from './big-input';

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
  let handleChange = useCallback((value) => {
    onChange(value ? parseInt(value, 10) : 0);
  }, [onChange]);

  return (
    <BigInput
      type="number"
      label={label}
      value={value || '0'}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      data-test-currency-input
    >
      <Currency
        value={value == null ? defaultValue : value}
        data-test-currency-value
        {...props}
      />
    </BigInput>
  );
}
