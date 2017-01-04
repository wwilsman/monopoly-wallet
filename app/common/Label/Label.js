import React from 'react'
import s from './Label.scss'

import Text from '../Text'

const Label = ({ className, ...props }) => (
  <Text className={[s.root, className]} {...props}/>
)

export default Label
