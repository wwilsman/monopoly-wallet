import React, { Component } from 'react'
import s from './Toaster.scss'

import { View } from '../../common'
import Toast from '../Toast'

class Toaster extends Component {
  state = {
    toasts: []
  }

  showToast(message, { timeout = 3000, ...options } = {}) {
    const key = new Date().getTime()

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
    const i = this.state.toasts.findIndex((t) => t.key === key)

    this.setState({
      toasts: [ ...this.state.toasts.slice(0, i),
        ...this.state.toasts.slice(i + 1) ]
    })
  }

  render() {
    return (
      <View className={s.root}>
        {this.state.toasts.map((toast) => (
           <Toast onDismiss={() => this.removeToast(toast.key)} {...toast}/>
         ))}
      </View>
    )
  }
}

export default Toaster
