import React from 'react'
import className from 'classnames/bind'
import styles from './Flex.css'

const cx = className.bind(styles)

const Flex = ({
  direction,
  align,
  justify,
  className,
  ...props
}) => (
  <div
      className={cx('root', {
          'row': direction === 'row',
          'align-center': align === 'center',
          'justify-center': justify === 'center',
          'justify-between': justify === 'space-between'
        }, className)}
      {...props}
  />
)

export default Flex
