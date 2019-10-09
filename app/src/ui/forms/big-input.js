import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import { useDataAttrProps } from '../../helpers/hooks';
import { Text } from '../typography';
import styles from './forms.css';

const cx = classNames.bind(styles);

BigInput.propTypes = {
  value: PropTypes.any,
  type: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  children: PropTypes.node
};

export default function BigInput({
  value,
  type,
  label,
  onChange,
  onFocus,
  onBlur,
  children,
  ...props
}) {
  let [dataAttrs, rest] = useDataAttrProps(props);
  let handleChange = useCallback(({ target }) => {
    onChange(target.value);
  }, [onChange]);

  return (
    <label
      className={cx('big-input')}
      {...dataAttrs}
    >
      {label && (
        <span className={cx('label')}>
          {label}
        </span>
      )}

      <input
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        type={type}
      />

      {children || (
        <Text data-test-value {...rest}>
          {value}
        </Text>
      )}
    </label>
  );
}
