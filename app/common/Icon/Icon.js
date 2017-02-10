import React from 'react'
import className from 'classnames/bind'
import styles from './Icon.css'

const cx = className.bind(styles)

const Icon = ({ name, themed, theme, className }) => (
  <span className={cx('root', className)}>
    <svg>
      <use xlinkHref={themed ? (
        `/themes/${theme}/icons.svg#${name}`
      ) : (
        `/icons.svg#${name}`
      )}/>
    </svg>
  </span>
)

export default Icon
