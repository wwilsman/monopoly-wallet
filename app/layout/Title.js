import React from 'react'

import { Text } from '../core/components'

const Title = ({ style, children }) => (
  <Text style={{ ...styles.title, ...style }}>
    {children}
  </Text>
)

const styles = {
  title: {
    fontSize: 24,
    color: 'white'
  }
}

export default Title
