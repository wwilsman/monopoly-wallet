import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './forms.css';

import { uuid, dataAttrs } from '../../utils';

const cx = classNames.bind(styles);

class Input extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChangeText: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    length: PropTypes.number,
    alt: PropTypes.bool
  };

  state = {
    focused: false,
    empty: false
  };

  elementId = uuid(Input);

  handleChange = (e) => {
    const { disabled, length, onChangeText } = this.props;
    const { empty } = this.state;
    let { value } = e.target;

    if (disabled) return;

    if (empty && value) {
      this.setState({ empty: false });
    } else if (!empty && !value) {
      this.setState({ empty: true });
    }

    if (typeof length === 'number') {
      value = value.substr(0, length);
    }

    onChangeText(value);
  };

  handleFocus = () => {
    this.setState({ focused: true });
  };

  handleBlur = () => {
    this.setState({ focused: false });
  };

  render() {
    const {
      alt,
      label,
      value,
      error,
      placeholder,
      disabled,
      ...props
    } = this.props;

    const {
      focused,
      empty
    } = this.state;

    const inputId = `${this.elementId}-input`;
    const rootClassName = cx('root', {
      'is-error': !!error,
      'has-focus': focused,
      'is-empty': empty,
      'is-disabled': disabled,
      alt
    });

    return (
      <div
          id={this.elementId}
          className={rootClassName}
          {...dataAttrs(props)}>
        <label
            className={styles.label}
            htmlFor={inputId}
            data-test-label>
          <span>{label}</span>

          {!!error && (
            <span
                className={styles.error}
                data-test-error>
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
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            data-test-input/>
      </div>
    );
  }
}

export default Input;
