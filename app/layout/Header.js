import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export const Header = ({ children }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>
      {children}
    </Text>
  </View>
)

const styles = StyleSheet.create({
  header: {
    padding: 40
  },
  headerTitle: {
    fontFamily: 'Futura',
    fontSize: 24,
    color: 'white'
  }
})
