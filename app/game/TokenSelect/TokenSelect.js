import React from 'react'
import className from 'classnames/bind'
import styles from './TokenSelect.css'

const cx = className.bind(styles)

import { Icon } from '../../common'

const TokenSelect = ({ tokens, selected, onChange }) => (
  <div className={styles.root}>
    {tokens.map((token) => (
       <div
           key={token.name}
           onClick={() => !token.disabled && onChange(token)}
           className={cx('token', {
               'is-selected': selected && token.name === selected.name,
               'is-disabled': token.disabled
             })}>
         <Icon themed name={token.name} className={styles.icon}/>
       </div>
     ))}
  </div>
)

export default TokenSelect
