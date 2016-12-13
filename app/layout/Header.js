import React from 'react'
import { View, StyleSheet } from 'react-native'

import Title from './Title'

const Header = ({ children }) => (
  <View style={styles.header}>
    {typeof children !== 'string' ? children :
      <Title>{children}</Title>}
  </View>
)

export default Header

const styles = StyleSheet.create({
  header: {
    padding: 40,
    alignItems: 'center'
  }
})
