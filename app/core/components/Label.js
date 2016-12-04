import React from 'react'
import { StyleSheet, Text } from 'react-native'

export const Label = ({ style, children }) => (
  <Text style={[styles.label, style]}>
    {children}
  </Text>
)

const styles = StyleSheet.create({
  label: {
    color: '#888888',
    fontFamily: 'Futura',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 15
  }
})
