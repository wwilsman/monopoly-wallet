import React from 'react'

import Text from './Text'

const Button = ({
  style,
  disabledStyle,
  textStyle,
  disabledTextStyle,
  secondary,
  disabled,
  children,
  onPress,
  ...props
}) => {
  let btnStyle = { ...styles.button, ...style }
  let btnTxtStyle = { ...styles.text }

  if (secondary) {
    btnTxtStyle = { ...btnTxtStyle, ...styles.secondaryText }
  }

  if (disabled) {
    btnStyle = { ...btnStyle, ...styles.disabled, ...disabledStyle }
    btnTxtStyle = { ...btnTxtStyle, ...disabledTextStyle }
  }

  return (
    <button
        style={btnStyle}
        disabled={disabled}
        onClick={(e) => !disabled && onPress(e)}
        {...props}>
      <Text style={btnTxtStyle}>
        {children}
      </Text>
    </button>
  )
}

const styles = {
  button: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5
  },
  disabled: {
    opacity: 0.3
  },
  text: {
    fontSize: 16,
    color: 'white'
  },
  secondaryText: {
    color: '#eee'
  }
}

export default Button
