import React from 'react'
import { StyleSheet, View } from 'react-native'

export const Content = ({ children }) => (
  <View style={styles.content}>
    {children}
  </View>
)

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingRight: 40,
    paddingLeft: 40
  }
})
