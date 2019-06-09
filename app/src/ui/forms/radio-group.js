import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './forms.css';

import { useUID, dataAttrs } from '../../utils';

const cx = classNames.bind(styles);

RadioGroup.propTypes = {
  data: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  selected: PropTypes.number.isRequired,
  disabled: PropTypes.arrayOf(PropTypes.number),
  renderItem: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  disableAll: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  itemClassName: PropTypes.string
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
  ...props
}) {
  let elementId = useUID('radio-group');
  let [focused, setFocused] = useState(false);
  let handleFocus = useCallback(() => setFocused(true), [setFocused]);
  let handleBlur = useCallback(() => setFocused(false), [setFocused]);

  return (
    <fieldset
      className={cx('root', {
        'is-error': !!error,
        'has-focus': focused,
        'is-disabled': disableAll
      })}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...dataAttrs(props)}
    >
      <legend
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
      </legend>

      <div className={className}>
        {data.map((item, i) => {
          // attempt to get an identifier for this item
          let id = typeof item === 'string' ? item : (item.id || i);
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
    </fieldset>
  );
}
