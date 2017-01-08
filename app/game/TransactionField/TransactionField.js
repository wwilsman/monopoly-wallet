import React, { Component, PropTypes } from 'react'
import s from './TransactionField.scss'

import { formatCurrency } from '../../utils'

import { View, Text, Icon } from '../../common'

class TransactionField extends Component {
  static propTypes = {
    payee: PropTypes.string.isRequired,
    collect: PropTypes.bool
  }

  static defaultProps = {
    collect: false
  }

  static contextTypes = {
    socket: PropTypes.object
  }

  state = {
    amount: 0
  }

  _handleKeyDown = (e) => {
    const { which } = e
    const char = String.fromCharCode(which)
    let amount = (this.state.amount + '')

    e.preventDefault()

    if (which === 8) {
      amount = amount.substr(0, amount.length - 1)

    } else if (char.match(/^\d+$/)) {
      amount = amount + char

    } else {
      if (which === 13) {
        this.confirmTransaction()
      }

      return
    }

    amount = parseInt(amount, 10) || 0
    this.setState({ amount })
  }

  confirmTransaction() {
    const { socket } = this.context
    const { payee, collect } = this.props
    const { amount } = this.state

    if (!amount) return

    if (collect) {
      socket.emit('game:collect-money', amount)
    } else if (payee === 'bank') {
      socket.emit('game:pay-bank', amount)
    } else {
      socket.emit('game:pay-player', payee, amount)
    }

    this.setState({ amount: 0 })
    this.blur()
  }

  focus = () => {
    this.input && this.input.focus()
  }

  blur = () => {
    this.input && this.input.blur()
  }

  render() {
    const { collect } = this.props
    const { amount } = this.state

    const amountClassName = [
      s.amount,
      (collect ? s.collect : s.pay),
      (!amount && s.empty)
    ]

    return (
      <View className={s.root}>
        <input
            ref={(input) => this.input = input}
            onKeyDown={this._handleKeyDown}
            pattern="\d*"
            value=""
        />

        <Text className={amountClassName}
              onClick={this.focus}>
          <Icon name="currency"/>
          {formatCurrency(amount)}
        </Text>
      </View>
    )
  }
}

export default TransactionField
