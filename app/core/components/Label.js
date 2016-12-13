import React from 'react'
import { Text, StyleSheet } from 'react-native'

const Label = ({ style, children }) => (
  <Text style={[styles.label, style]}>
    {children}
  </Text>
)

export default Label

const styles = StyleSheet.create({
  label: {
    color: '#888888',
    fontFamily: 'Futura',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 15
  }
})
