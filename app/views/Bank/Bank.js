import React, { Component } from 'react'

import { Container, Content } from '../../common'
import { PropertyList } from '../../properties'

class Bank extends Component {

  render() {
    const { properties } = this.props

    return (
      <Container>
        <PropertyList properties={properties}/>
      </Container>
    )
  }
}

export default Bank
