import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './input.css';

import { uuid, dataAttrs } from '../../utils';

const cx = classNames.bind(styles);

class Input extends Component {
  static propTypes = {
    id: PropTypes.string,
    alt: PropTypes.bool,
    length: PropTypes.number,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    onChangeText: PropTypes.func
  };

  state = {
    focused: false,
    empty: false
  };

  elementId = uuid(Input);

  handleChange = (e) => {
    const { length, onChangeText } = this.props;
    const { empty } = this.state;
    let { value } = e.target;

    if (empty && value) {
      this.setState({ empty: false });
    } else if (!empty && !value) {
      this.setState({ empty: true });
    }

    if (typeof length === 'number') {
      value = value.substr(0, length);
    }

    if (onChangeText) {
      onChangeText(value);
    }
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
      ...props
    } = this.props;

    const {
      focused,
      empty
    } = this.state;

    const rootClassName = cx('root', {
      'is-error': !!error
    });

    const labelClassName = cx('label', {
      'has-focus': focused,
      'is-empty': empty
    });

    const inputId = `${this.elementId}-input`;
    const inputClassName = cx('input', {
      'has-focus': focused,
      'is-empty': empty,
      alt
    });

    return (
      <div
          id={this.elementId}
          className={rootClassName}
          {...dataAttrs(props)}>
        <label
            className={labelClassName}
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
            className={inputClassName}
            value={value}
            placeholder={placeholder}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            data-test-input/>
      </div>
    );
  }
}

export default Input;
