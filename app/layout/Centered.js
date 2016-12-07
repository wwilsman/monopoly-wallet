import React from 'react'
import { StyleSheet, View } from 'react-native'

export const Centered = ({ children }) => (
  <View style={styles.centered}>
    {children}
  </View>
)

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
