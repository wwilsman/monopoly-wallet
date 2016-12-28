import React, { Component } from 'react'

import { Container, Content } from '../layout'
import { PropertyList } from '../properties'

class Bank extends Component {

  render() {
    let { properties } = this.props

    return (
      <Container>
        <PropertyList
            style={styles.propertyList}
            properties={properties}
            cardsToShow={5}
            offset={40}
        />
      </Container>
    )
  }
}

const styles = {
  propertyList: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 0,
    left: 0
  }
}

export default Bank
