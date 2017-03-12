import React from 'react'
import styles from './Label.css'

import Text from '../Text'

const Label = ({ close, ...props }) => (
  <Text sm className={!close && styles['margin-bottom']} {...props}/>
)

export default Label
