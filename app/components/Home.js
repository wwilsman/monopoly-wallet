import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Link } from 'react-router'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10
  }
})

export class Home extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Monopoly Wallet
        </Text>
        <Link to="/new">
          New Game
        </Link>
      </View>
    )
  }
}
