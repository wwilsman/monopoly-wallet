import React, { Children } from 'react'
import { StyleSheet, Text, View } from 'react-native'

export const Container = ({ children }) => (
  <View style={styles.container}>
    {children}
  </View>
)

export const Header = ({ children }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>
      {children}
    </Text>
  </View>
)

export const Content = ({ children }) => (
  <View style={styles.content}>
    {children}
  </View>
)

export const Footer = ({ children }) => (
  <View style={styles.footer}>
    {Children.map(children, (child) => (
      <View style={styles.footerSection}>
        {child}
      </View>
    ))}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: '#222'
  },
  header: {
    padding: 40
  },
  headerTitle: {
    fontFamily: 'Futura',
    fontSize: 24,
    color: 'white'
  },
  content: {
    flex: 1,
    paddingRight: 40,
    paddingLeft: 40
  },
  footer: {
    paddingTop: 40,
    paddingRight: 20,
    paddingBottom: 40,
    paddingLeft: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  footerSection: {
    flexBasis: '50%',
    alignItems: 'center',
    paddingRight: 20,
    paddingLeft: 20
  }
})
