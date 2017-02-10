import React from 'react'
import className from 'classnames/bind'
import styles from './Button.css'

const cx = className.bind(styles)

const Button = ({
  color,
  width,
  small,
  icon,
  className,
  ...props
}) => (
  <button className={cx('root', {
      'plain': !color,
      'blue': color === 'blue',
      'green': color === 'green',
      'red': color === 'red',
      'grey': color === 'grey',
      'dark': color === 'dark',
      'half-width': width === '1/2',
      'third-width': width === '1/3',
      'full-width': width === 'full',
      'is-disabled': props.disabled,
      'is-small': small,
      'has-icon': icon
    }, className)} {...props}/>
)

export default Button
