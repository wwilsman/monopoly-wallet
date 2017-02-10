import React from 'react'
import className from 'classnames/bind'
import styles from './Box.css'

import Flex from '../Flex'

const cx = className.bind(styles)

const Box = ({ size, stretch, className, ...props }) => (
  <div className={cx('root', {
      'stretch': stretch,
      'half-size': size === '1/2',
      'quarter-size': size === '1/4',
      'three-quarter-size': size === '3/4',
      'eighth-size': size === '1/8',
    }, className)}>
    <Flex {...props}/>
  </div>
)

export default Box
