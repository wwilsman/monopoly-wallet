import React, { Component, PropTypes } from 'react'
import styles from './Toast.css'

import { Text } from '../../layout'
import { Icon, Currency } from '../../common'

const messageReg = /(\{(?:t|p|\$):.*?\})/
const playerReg = /^\{t:(.*?)\}$|.*/
const propertyReg = /^\{p:(.*?)\}$|.*/
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

    const parts = message.split(messageReg).filter(Boolean).map((part) => ({
      currency: parseInt(part.replace(currencyReg, '$1'), 10),
      property: part.replace(propertyReg, '$1'),
      player: part.replace(playerReg, '$1'),
      content: part
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
