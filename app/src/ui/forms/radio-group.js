import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './forms.css';

import { uid, dataAttrs } from '../../utils';

const cx = classNames.bind(styles);

class RadioGroup extends Component {
  static propTypes = {
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

  static defaultProps = {
    disabled: []
  };

  state = {
    focused: false
  };

  elementId = uid('RadioGroup');

  _handleFocus = () => {
    this.setState({ focused: true });
  };

  _handleBlur = () => {
    this.setState({ focused: false });
  };

  _selectItem(i) {
    let {
      data,
      selected,
      disabled,
      disableAll,
      onSelect
    } = this.props;

    if (i !== selected && !(disableAll || disabled.includes(i))) {
      return () => onSelect(data[i]);
    }
  }

  renderItem(item, i) {
    let {
      selected,
      disabled,
      disableAll,
      itemClassName,
      renderItem
    } = this.props;

    // attempt to get an identifier for this item
    let id = typeof item === 'string' ? item : (item.id || i);
    let elemId = `${this.elementId}-${id}`;

    let attrs = {
      selected: i === selected,
      disabled: disableAll || disabled.includes(i)
    };

    return (
      <label
          key={i}
          htmlFor={elemId}
          className={itemClassName}
          data-test-radio-item={id}>
        <input
            id={elemId}
            type="radio"
            disabled={attrs.disabled}
            onChange={this._selectItem(i)}
            checked={attrs.selected}/>
        {renderItem(item, attrs)}
      </label>
    );
  }

  render() {
    let {
      data,
      label,
      error,
      disableAll,
      className,
      ...props
    } = this.props;

    let rootClassName = cx('root', {
      'is-error': !!error,
      'has-focus': this.state.focused,
      'is-disabled': disableAll
    });

    return (
      <fieldset
          className={rootClassName}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          {...dataAttrs(props)}>
        <legend
            className={styles.label}
            data-test-label>
          <span>{label}</span>

          {!!error && (
            <span
                className={styles.error}
                data-test-error>
              {error}
            </span>
          )}
        </legend>

        <div className={className}>
          {data.map(this.renderItem, this)}
        </div>
      </fieldset>
    );
  }
}

export default RadioGroup;
