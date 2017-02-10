import React, { Component, PropTypes } from 'react'
import className from 'classnames/bind'
import styles from './TextInput.css'

const cx = className.bind(styles)

class TextInput extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    onChangeText: PropTypes.func,
  }

  focus() {
    this.input.focus()
  }

  render() {
    const {
      onChange,
      onChangeText,
      className,
      ...props
    } = this.props

    return (
      <input
          ref={(ref) => this.input = ref}
          className={cx('input', className)}
          onChange={(e) => {
              onChangeText && onChangeText(e.target.value)
              return !onChange || onChange(e)
            }}
          {...props}
      />
    )
  }
}

export default TextInput
