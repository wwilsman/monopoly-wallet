import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import {
  Container,
  Title,
  Centered
} from '../layout'

import {
  Button
} from '../core/components'

export class Welcome extends Component {
  constructor(props) {
    super(props)

    this.newGame = this.newGame.bind(this)
  }

  newGame() {
    this.props.router.push('/new')
  }

  render() {
    return (
      <Container>
        <Centered>
          <Title style={styles.welcome}>
            Monopoly Wallet
          </Title>

          <Button onPress={this.newGame}>
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
