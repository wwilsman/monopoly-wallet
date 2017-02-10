import React from 'react'
import className from 'classnames/bind'
import styles from './Currency.css'

const cx = className.bind(styles)
const numberFormatReg = /(\d)(?=(\d{3})+$)/g

import Icon from '../Icon'

const Currency = ({ amount, className }) => (
  <span>
    <div className={cx('root', className)}>
      <Icon themed name="currency"/>
      {amount.toFixed().replace(numberFormatReg, '$1,')}
    </div>
  </span>
)

export default Currency
