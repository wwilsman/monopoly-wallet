import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'

import { Toast } from './components'

export default class Toaster extends Component {

  constructor(props) {
    super(props)

    this.state = {
      toasts: []
    }
  }

  render() {
    return (
      <View style={styles.toaster}>
        {this.state.toasts.map((toast) => (
          <Toast {...toast}
            onDismiss={() => this.removeToast(toast.key)}
          />
        ))}
      </View>
    )
  }

  showToast(message, { timeout = 3000, ...options } = {}) {
    let key = new Date().getTime()

    if (timeout > 0) {
      setTimeout(() => this.removeToast(key), timeout)
    }

    this.setState({
      toasts: [ ...this.state.toasts,
        { key, message, ...options }
      ]
    })
  }

  removeToast(key) {
    let i = this.state.toasts.findIndex((t) => t.key === key)

    this.setState({
      toasts: [ ...this.state.toasts.slice(0, i),
        ...this.state.toasts.slice(i + 1) ]
    })
  }
}

const styles = StyleSheet.create({
  toaster: {
    position: 'absolute',
    bottom: 0,
    zIndex: 9999,
    width: '100%'
  }
})
