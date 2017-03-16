import React from 'react'
import className from 'classnames/bind'
import styles from './Text.css'

const cx = className.bind(styles)

const Text = ({
  sm,
  med,
  lg,
  xl,
  xxl,
  xxxl,
  center,
  upcase,
  block,
  inherit,
  className,
  ...props
}) => (
  <span
      className={cx({
          'is-sm': sm,
          'is-med': med,
          'is-lg': lg,
          'is-xl': xl,
          'is-xxl': xxl,
          'is-xxxl': xxxl,
          'is-uppercase': upcase,
          'is-centered': center,
          'is-block': block,
          'default': !(inherit||sm||med||lg||xl||xxl)
        }, className)}
      {...props}
  />
)

export default Text
