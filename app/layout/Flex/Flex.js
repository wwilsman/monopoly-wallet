import React from 'react'
import className from 'classnames/bind'
import styles from './Flex.css'

const cx = className.bind(styles)

const Flex = ({
  row,
  align,
  justify,
  container,
  className,
  ...props
}) => (
  <div
      className={cx('root', {
          'row': row,
          'full-size': container,
          'align-center': align === 'center',
          'align-end': align === 'end',
          'justify-center': justify === 'center',
          'justify-stretch': justify === 'stretch',
          'justify-between': justify === 'space-between'
        }, className)}
      {...props}
  />
)

export default Flex
