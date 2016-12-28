import React from 'react'

import { View } from '../core/components'

const Centered = ({ children }) => (
  <View style={styles.centered}>
    {children}
  </View>
)

const styles = {
  centered: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  }
}

export default Centered
