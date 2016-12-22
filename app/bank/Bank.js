import React, { Component } from 'react'
import { StyleSheet } from 'react-native'

import {
  Container,
  Content
} from '../layout'

import {
  PropertyList
} from '../properties'

export default class extends Component {

  render() {
    let { properties } = this.props

    return (
      <Container>
        <PropertyList
          style={styles.propertyList}
          properties={properties}
          start={0}
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
