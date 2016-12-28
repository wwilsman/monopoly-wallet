import React from 'react'

import { View } from '../core/components'

const Content = ({ children }) => (
  <View style={styles.content}>
    {children}
  </View>
)

const styles = {
  content: {
    flex: 1,
    paddingRight: 30,
    paddingLeft: 30
  }
}

export default Content
