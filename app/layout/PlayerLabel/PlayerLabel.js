import React from 'react'
import styles from './PlayerLabel.css'

import { Text } from '../../layout'
import { Icon } from '../../common'

const PlayerLabel = ({ token, name }) => (
  <Text lg>
    <Icon themed name={token} className={styles.icon}/>
    <Text sm upcase>{name}</Text>
  </Text>
)

export default PlayerLabel
