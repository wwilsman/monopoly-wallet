import React from 'react'
import styles from './Label.css'

import Text from '../Text'

const Label = (props) => (
  <Text sm center className={styles.root} {...props}/>
)

export default Label
