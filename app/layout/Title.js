import React from 'react'
import { Text, StyleSheet } from 'react-native'

const Title = ({ style, children }) => (
  <Text style={[styles.title, style]}>
    {children}
  </Text>
)

export default Title

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Futura',
    fontSize: 24,
    color: 'white'
  }
})
