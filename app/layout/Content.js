import React from 'react'
import { View, StyleSheet } from 'react-native'

const Content = ({ children }) => (
  <View style={styles.content}>
    {children}
  </View>
)

export default Content

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingRight: 30,
    paddingLeft: 30
  }
})
