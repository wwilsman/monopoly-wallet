import React, { Component, PropTypes } from 'react'
import { StyleSheet, View, Text } from 'react-native'

const styles = StyleSheet.create({
  pre: {
    padding: 5,
    backgroundColor: '#E4EBEE',
    minWidth: 300
  },
  preText: {
    whiteSpace: 'pre',
    fontFamily: 'Roboto Mono',
    fontSize: 11
  }
})

export class EditConfig extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired
  }

  render() {
    let { config } = this.props

    return (
      <View style={styles.pre}>
        <Text style={styles.preText}>
          {JSON.stringify(config, null, 2)}
        </Text>
      </View>
    )
  }
}
