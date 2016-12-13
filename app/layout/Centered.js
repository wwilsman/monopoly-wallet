import React from 'react'
import { View, StyleSheet } from 'react-native'

const Centered = ({ children }) => (
  <View style={styles.centered}>
    {children}
  </View>
)

export default Centered

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
