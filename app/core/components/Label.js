import React from 'react'

import Text from './Text'

const Label = ({ style, children }) => (
  <Text style={{ ...styles.label, ...style }}>
    {children}
  </Text>
)

const styles = {
  label: {
    fontSize: 11,
    color: '#888888',
    textTransform: 'uppercase',
    marginBottom: 15
  }
}

export default Label
