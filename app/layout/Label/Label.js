import React from 'react'
import styles from './Label.css'

import Text from '../Text'

const Label = ({ left, close, ...props }) => (
  <Text
      sm
      center={!left}
      className={!close && styles['margin-bottom']}
      {...props}
  />
)

export default Label
