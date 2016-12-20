import React from 'react'
import { View, StyleSheet } from 'react-native'

import Title from './Title'

const Header = ({ children, onLayout }) => (
  <View style={styles.header} onLayout={onLayout}>
    {typeof children !== 'string' ? children :
      <Title>{children}</Title>}
  </View>
)

export default Header

const styles = StyleSheet.create({
  header: {
    padding: 40,
    paddingBottom: 30,
    alignItems: 'center'
  }
})
