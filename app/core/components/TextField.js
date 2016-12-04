import React from 'react'
import { StyleSheet, TextInput } from 'react-native'

export const TextField = ({ style, ...props }) => (
  <TextInput {...props}
    style={[
      styles.input,
      !props.value ? styles.emptyInput : null,
      style
    ]}
  />
)

const styles = StyleSheet.create({
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
