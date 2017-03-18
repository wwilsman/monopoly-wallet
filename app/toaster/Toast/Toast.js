import React, { Component, PropTypes } from 'react'
import styles from './Toast.css'

import { Text } from '../../layout'
import { Icon, Currency } from '../../common'

const messageReg = /(\{(?:t|p|\$):.*?\})/
const playerReg = /^\{t:(.*?)\}$|.*/
const propertyReg = /^\{p:(.*?)\}$|.*/
const currencyReg = /^\{\$:(.*?)\}$|.*/
const lastSpaceReg = /\s([\S]+)$/

class Toast extends Component {
  static propTypes = {
    onDismiss: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    players: PropTypes.object.isRequired,
    timeout: PropTypes.number
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
    const { message, players } = this.props

    const parts = message.split(messageReg).filter(Boolean).map((part) => ({
      currency: parseInt(part.replace(currencyReg, '$1'), 10),
      property: part.replace(propertyReg, '$1'),
      player: part.replace(playerReg, '$1'),
      content: part.replace(lastSpaceReg, '\u00A0$1')
    }))

    return (
      <Text sm className={styles.message}>
        {parts.map((part) => (
           (part.property ? (
             part.property.toUpperCase()
           ) : part.player ? (
             players[part.player].toUpperCase()
           ) : part.currency ? (
             <Currency amount={part.currency}/>
           ) : part.content)
         ))}
      </Text>
    )
  }

  render() {
    return null
  }
}

export default Toast
