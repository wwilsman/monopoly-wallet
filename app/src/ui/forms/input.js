import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './forms.css';

import {
  useUID,
  useDataAttrs
} from '../../helpers/hooks';

const cx = classNames.bind(styles);

Input.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChangeText: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  length: PropTypes.number,
  alt: PropTypes.bool
};

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  disabled,
  error,
  length,
  alt,
  ...props
}) {
  let [focused, setFocused] = useState(false);
  let [empty, setEmpty] = useState(false);
  let dataAttrs = useDataAttrs(props);
  let elementId = useUID('input');
  let inputId = `${elementId}-input`;

  let handleFocus = useCallback(() => setFocused(true), []);
  let handleBlur = useCallback(() => setFocused(false), []);
  let handleChange = useCallback(({ target: { value } }) => {
    if (disabled) return;

    if (empty && value) {
      setEmpty(false);
    } else if (!empty && !value) {
      setEmpty(true);
    }

    if (typeof length === 'number') {
      value = value.substr(0, length);
    }

    onChangeText(value);
  }, [disabled, empty, length, onChangeText]);

  return (
    <div
      id={elementId}
      className={cx('root', {
        'is-error': !!error,
        'has-focus': focused,
        'is-empty': empty,
        'is-disabled': disabled,
        alt
      })}
      {...dataAttrs}
    >
      <label
        className={styles.label}
        htmlFor={inputId}
        data-test-label
      >
        <span>{label}</span>

        {!!error && (
          <span
            className={styles.error}
            data-test-error
          >
            {error}
          </span>
        )}
      </label>

      <input
        id={inputId}
        className={styles.input}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-test-input
      />
    </div>
  );
}
