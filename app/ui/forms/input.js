import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './forms.css';

import { uuid, dataAttrs } from '../../utils';

const cx = classNames.bind(styles);

class Input extends Component {
  static propTypes = {
    alt: PropTypes.bool,
    length: PropTypes.number,
    error: PropTypes.string,
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

    const inputId = `${this.elementId}-input`;
    const rootClassName = cx('root', {
      'is-error': !!error,
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
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            data-test-input/>
      </div>
    );
  }
}

export default Input;
