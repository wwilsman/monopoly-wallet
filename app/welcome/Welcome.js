import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import {
  Container,
  Title,
  Centered
} from '../layout'

import {
  Button
} from '../core/components'

const Welcome = ({ router }) => (
  <Container>
    <Centered>
      <Title style={styles.welcome}>
        Monopoly Wallet
      </Title>

      <Button onPress={() => router.push('/new')}>
        New Game
      </Button>
    </Centered>
  </Container>
)

export default Welcome

const styles = StyleSheet.create({
  welcome: {
    fontSize: 36,
    marginBottom: 20
  }
})
