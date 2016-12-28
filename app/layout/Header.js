import React, { Component } from 'react'

import { View } from '../core/components'
import Title from './Title'

class Header extends Component {
  render() {
    const { style, children, ...props } = this.props

    return (
      <View style={{ ...styles.header, ...style }} {...props}>
        {typeof children !== 'string' ? children : (<Title>{children}</Title>)}
      </View>
    )
  }
}

const styles = {
  header: {
    paddingTop: 20,
    paddingRight: 30,
    paddingBottom: 20,
    paddingLeft: 30,
    alignItems: 'center'
  }
}

export default Header
