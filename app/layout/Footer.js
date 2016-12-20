import React, { Children } from 'react'
import { View, StyleSheet } from 'react-native'

const Footer = ({ children }) => (
  <View style={styles.footer}>
    {Children.map(children, (child) => (
      <View style={styles.footerSection}>
        {child}
      </View>
    ))}
  </View>
)

export default Footer

const styles = StyleSheet.create({
  footer: {
    paddingTop: 35,
    paddingRight: 15,
    paddingBottom: 25,
    paddingLeft: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  footerSection: {
    flexBasis: '50%',
    alignItems: 'center',
    paddingRight: 15,
    paddingLeft: 15
  }
})
