import React, { Component, PropTypes } from 'react'
import { View, Text, StyleSheet } from 'react-native'

import {
  Container,
  Title,
  Centered
} from '../layout'

import {
  Button
} from '../core/components'

export default class Welcome extends Component {
  static contextTypes = {
    router: PropTypes.object
  }

  render() {
    let { router } = this.context

    return (
      <Container>
        <Centered>
          <Title style={styles.welcome}>
            Monopoly Wallet
          </Title>

          <Button onPress={() => router.transitionTo({ pathname: '/new' })}>
            New Game
          </Button>
        </Centered>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 36,
    marginBottom: 20
  }
})
