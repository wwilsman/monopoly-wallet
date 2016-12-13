import React from 'react'
import { View, StyleSheet } from 'react-native'

const Container = ({ style, children }) => (
  <View style={[styles.container, style]}>
    {children}
  </View>
)

export default Container

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: '#222'
  }
})
