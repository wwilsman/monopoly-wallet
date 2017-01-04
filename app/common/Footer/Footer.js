import React, { Children } from 'react'
import s from './Footer.scss'

import View from '../View'

const Footer = ({ children, ...props }) => (
  <View className={s.root} {...props}>
    {Children.map(children, (child) => (
       <View className={s.section}>
         {child}
       </View>
     ))}
  </View>
)

export default Footer
