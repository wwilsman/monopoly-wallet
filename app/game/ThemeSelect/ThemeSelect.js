import React from 'react'
import className from 'classnames/bind'
import styles from './ThemeSelect.css'

const cx = className.bind(styles)

import { Flex, Text } from '../../layout'

const ThemeSelect = ({ themes, selected, onChange }) => (
  <Flex className={styles.root}>
    {themes.map((theme) => (
       <Flex
           key={theme.theme}
           onClick={() => onChange(theme)}
           className={cx('theme', {
               'is-selected': theme === selected
             })}>
         <Text lg className={styles.title}>{theme.name}</Text>
         <Text sm>{theme.descr}</Text>
       </Flex>
     ))}
  </Flex>
)

export default ThemeSelect
