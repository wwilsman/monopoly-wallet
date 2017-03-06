import React from 'react'
import className from 'classnames/bind'
import styles from './Button.css'

const cx = className.bind(styles)

const Button = ({
  color,
  width,
  small,
  icon,
  loading,
  onClick,
  className,
  children,
  ...props
}) => (
  <button
      onClick={(e) => !loading && onClick && onClick(e)}
      className={cx('root', {
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
          'is-loading': loading,
          'is-small': small,
          'has-icon': icon
        }, className)}
      {...props}>
    {!loading && children}
  </button>
)

export default Button
