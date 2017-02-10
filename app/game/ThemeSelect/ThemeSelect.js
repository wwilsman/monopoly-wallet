import React from 'react'
import className from 'classnames/bind'
import styles from './ThemeSelect.css'

const cx = className.bind(styles)

import { Text } from '../../layout'

const ThemeSelect = ({ themes, selected, onChange }) => (
  <div className={styles.root}>
    {themes.map((theme) => (
       <div
           key={theme._id}
           onClick={() => onChange(theme)}
           className={cx('theme', {
               'is-selected': theme === selected
             })}>
         <Text lg className={styles.title}>{theme.name}</Text>
         <Text sm>{theme.description}</Text>
       </div>
     ))}
  </div>
)

export default ThemeSelect
