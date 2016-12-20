import React from 'react'
import { View, StyleSheet } from 'react-native'

import Title from './Title'

const Header = ({ style, onLayout, children }) => (
  <View style={[styles.header, style]} onLayout={onLayout}>
    {typeof children !== 'string' ? children :
      <Title>{children}</Title>}
  </View>
)

export default Header

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingRight: 30,
    paddingBottom: 20,
    paddingLeft: 30,
    alignItems: 'center'
  }
})
