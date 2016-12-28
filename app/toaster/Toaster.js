import React, { Component } from 'react'

import { View } from '../core/components'
import { Toast } from './components'

class Toaster extends Component {
  state = {
    toasts: []
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

  render() {
    return (
      <View style={styles.toaster}>
        {this.state.toasts.map((toast) => (
           <Toast onDismiss={() => this.removeToast(toast.key)} {...toast}/>
         ))}
      </View>
    )
  }
}

const styles = {
  toaster: {
    position: 'absolute',
    top: 0,
    zIndex: 9999,
    width: '100%'
  }
}

export default Toaster
