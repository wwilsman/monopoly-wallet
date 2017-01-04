import React from 'react'
import s from './Header.scss'

import View from '../View'
import Text from '../Text'

const Header = ({ children, ...props }) => (
  <View className={s.root} {...props}>
    <Text className={s.title}>{children}</Text>
  </View>
)

export default Header
