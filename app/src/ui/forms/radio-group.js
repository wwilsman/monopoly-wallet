import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './forms.css';

import {
  useUID,
  useDataAttrs
} from '../../helpers/hooks';

const cx = classNames.bind(styles);

RadioGroup.propTypes = {
  data: PropTypes.array.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  selected: PropTypes.number.isRequired,
  disabled: PropTypes.arrayOf(PropTypes.number),
  renderItem: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  disableAll: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  itemClassName: PropTypes.string,
  itemIdKey: PropTypes.string
};

RadioGroup.defaultProps = {
  disabled: []
};

export default function RadioGroup({
  data,
  label,
  selected,
  disabled,
  renderItem,
  onSelect,
  disableAll,
  error,
  className,
  itemClassName,
  itemIdKey = 'id',
  ...props
}) {
  let elementId = useUID('radio-group');
  let [focused, setFocused] = useState(false);
  let handleFocus = useCallback(() => setFocused(true), [setFocused]);
  let handleBlur = useCallback(() => setFocused(false), [setFocused]);
  let dataAttrs = useDataAttrs(props);

  return (
    <div
      className={cx('root', {
        'is-error': !!error,
        'has-focus': focused,
        'is-disabled': disableAll
      })}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={0}
      {...dataAttrs}
    >
      {typeof label === 'function' ? label() : (
        <div
          className={styles.label}
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
        </div>
      )}

      <div className={className}>
        {data.map((item, i) => {
          // attempt to get an identifier for this item
          let id = typeof item === 'string' ? item : (item[itemIdKey] || i);
          let elemId = `${elementId}-${id}`;

          let attrs = {
            selected: i === selected,
            disabled: disableAll || disabled.includes(i)
          };

          let handleChange = () => {
            if (!attrs.selected && !attrs.disabled) {
              onSelect(data[i]);
            }
          };

          return (
            <label
              key={i}
              htmlFor={elemId}
              className={itemClassName}
              data-test-radio-item={id}
            >
              <input
                id={elemId}
                type="radio"
                disabled={attrs.disabled}
                checked={attrs.selected}
                onChange={handleChange}
              />

              {renderItem(item, attrs)}
            </label>
          );
        })}
      </div>
    </div>
  );
}
