import React from 'react'
import s from './Content.scss'

import View from '../View'

const Content = ({ centered, ...props }) => (
  <View className={[s.root, (centered && s.centered)]} {...props}/>
)

export default Content
