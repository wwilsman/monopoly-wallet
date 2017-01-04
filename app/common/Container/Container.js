import React from 'react'
import s from './Container.scss'

import View from '../View'

const Container = (props) => (
  <View className={s.root} {...props}/>
)

export default Container
