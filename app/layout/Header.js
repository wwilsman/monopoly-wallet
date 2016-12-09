import React from 'react'
import { StyleSheet, View } from 'react-native'

import { Title } from './Title'

export const Header = ({ children }) => (
  <View style={styles.header}>
    {typeof children !== 'string' ? children :
      <Title>{children}</Title>}
  </View>
)

const styles = StyleSheet.create({
  header: {
    padding: 40,
    alignItems: 'center'
  }
})
