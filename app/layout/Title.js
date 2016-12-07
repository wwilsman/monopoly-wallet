import React from 'react'
import { StyleSheet, Text } from 'react-native'

export const Title = ({ style, children }) => (
  <Text style={[styles.title, style]}>
    {children}
  </Text>
)

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Futura',
    fontSize: 24,
    color: 'white'
  }
})
