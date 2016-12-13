import React from 'react'
import { TextInput, StyleSheet } from 'react-native'

const TextField = ({ style, ...props }) => (
  <TextInput {...props}
    style={[
      styles.input,
      !props.value ? styles.emptyInput : null,
      style
    ]}
  />
)

export default TextField

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
