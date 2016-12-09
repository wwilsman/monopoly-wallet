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

export const Welcome = ({ router }) => (
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

const styles = StyleSheet.create({
  welcome: {
    fontSize: 36,
    marginBottom: 20
  }
})
