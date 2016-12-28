import React, { Component } from 'react'
import { StyleSheet } from 'react-native'

import {
  Container,
  Content
} from '../layout'

import {
  PropertyList
} from '../properties'

export default class Bank extends Component {
  state = {
    activeProperty: 0
  }

  render() {
    let { properties } = this.props
    let { activeProperty } = this.state

    return (
      <Container>
        <PropertyList
          style={styles.propertyList}
          onUpdate={(i) => this.setState({ activeProperty: i })}
          index={activeProperty}
          properties={properties}
          cardsToShow={5}
          offset={40}
        />
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  propertyList: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 0,
    left: 0
  }
})
