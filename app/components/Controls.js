import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

export const Label = ({ children }) => (
  <Text style={styles.label}>
    {children}
  </Text>
)

export const TextField = ({ style, ...props }) => (
  <TextInput {...props}
    style={[styles.input, !props.value ? styles.emptyInput : null, style]}
  />
)

const styles = StyleSheet.create({
  label: {
    color: '#888888',
    fontFamily: 'Futura',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 15
  },
  input: {
    fontSize: 16,
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    paddingBottom: 10,
    marginBottom: 40
  },
  emptyInput: {
    opacity: 0.6
  }
})
