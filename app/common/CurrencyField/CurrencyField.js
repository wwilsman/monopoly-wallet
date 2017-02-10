import React, { Component, PropTypes } from 'react'
import styles from './CurrencyField.css'

import Currency from '../Currency'

class CurrencyField extends Component {
  static propTypes = {
    amount: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onEnter: PropTypes.func,
    onBlur: PropTypes.func
  }

  _handleKeyDown = (e) => {
    const { which } = e
    const char = String.fromCharCode(which)
    let amount = (this.props.amount + '')

    e.preventDefault()

    if (which === 8) {
      amount = amount.substr(0, amount.length - 1)

    } else if (char.match(/^\d+$/)) {
      amount = amount + char

      if (parseInt(amount, 10) > 99999) {
        return
      }

    } else {
      if (which === 13 && this.props.onEnter) {
        this.props.onEnter()
      }

      return
    }

    amount = parseInt(amount, 10) || 0
    this.props.onChange(amount)
  }

  focus() {
    this.input.focus()
  }

  render() {
    const {
      amount,
      className,
      onBlur
    } = this.props

    return (
      <span className={className}>
        <Currency amount={amount}/>

        <input
            ref={(input) => this.input = input}
            className={styles.input}
            onKeyDown={this._handleKeyDown}
            onBlur={onBlur}
            pattern="\d*"
            value=""
        />
      </span>
    )
  }
}

export default CurrencyField
