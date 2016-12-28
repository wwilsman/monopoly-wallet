import React from 'react'

import { View } from '../core/components'

const Container = ({ style, children }) => (
  <View style={{ ...styles.container, ...style }}>
    {children}
  </View>
)

const styles = {
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: '#222'
  }
}

export default Container
