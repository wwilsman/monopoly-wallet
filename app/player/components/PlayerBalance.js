import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { Button } from '../../core/components'

const PlayerBalance = ({ balance }) => (
  <View style={styles.container}>
    <Text style={styles.balance}>
      {balance.toFixed().replace(/(\d)(?=(\d{3})+$)/g, '$1,')}
    </Text>
    <View style={styles.actions}>
      <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => console.log('collect')}>
        Collect
      </Button>

      <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={() => console.log('pay')}>
        Pay
      </Button>
    </View>
  </View>
)

export default PlayerBalance

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  balance: {
    fontSize: 32,
    fontFamily: 'futura',
    color: 'rgb(100,200,100)',
    marginBottom: 20
  },
  actions: {
    flexDirection: 'row'
  },
  button: {
    marginLeft: 10,
    marginRight: 10
  },
  buttonText: {
    fontSize: 12,
    color: '#CCC'
  }
})
