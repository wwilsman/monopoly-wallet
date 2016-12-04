import React from 'react'
import { StyleSheet, View } from 'react-native'

export const Container = ({ children }) => (
  <View style={styles.container}>
    {children}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: '#222'
  }
})
