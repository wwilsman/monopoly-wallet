import React, { Component, PropTypes } from 'react'
import styles from './Toast.css'

import { Text } from '../../layout'
import { Icon, Currency } from '../../common'

const messageReg = /(\{(?:p|\$):.*?\})/
const playerReg = /^\{p:(.*?)\}$|.*/
const currencyReg = /^\{\$:(.*?)\}$|.*/

class Toast extends Component {
  static propTypes = {
    onDismiss: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    timeout: PropTypes.number
  }

  static contextTypes = {
    players: PropTypes.object.isRequired
  }

  componentDidMount() {
    const { timeout, onDismiss } = this.props

    if (timeout) {
      this._timeout = setTimeout(onDismiss, timeout)
    }
  }

  componentWillUnmount() {
    if (this._timeout) {
      clearTimeout(this._timeout)
    }
  }

  renderMessage() {
    const { players } = this.context
    const { message } = this.props

    let parts = message.split(messageReg)
    parts = parts.filter(Boolean).map((part) => ({
      currency: parseInt(part.replace(currencyReg, '$1'), 10),
      player: part.replace(playerReg, '$1'),
      content: part
    }))

    return (
      <Text sm className={styles.message}>
        {parts.filter(Boolean).map((part, i) => (
           (part.player ? (
             <span key={i}>{players[part.player]}</span>
           ) : part.currency ? (
             <Currency key={i} amount={part.currency}/>
           ) : (
             <span key={i}>{part.content}</span>
           ))
         ))}
      </Text>
    )
  }

  render() {
    return null
  }
}

export default Toast
