import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { Button } from '../../core/components'

const PlayerBalance = ({ style, balance }) => (
  <View style={[styles.container, style]}>
    <Text style={styles.balance}>
      ${balance.toFixed().replace(/(\d)(?=(\d{3})+$)/g, '$1,')}
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
    fontSize: 28,
    fontFamily: 'futura',
    color: 'rgb(100,200,100)',
    marginBottom: 10
  },
  actions: {
    flexDirection: 'row'
  },
  button: {
    marginLeft: 5,
    marginRight: 5
  },
  buttonText: {
    fontSize: 16,
    color: '#CCC'
  }
})
