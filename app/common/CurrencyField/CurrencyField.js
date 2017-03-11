import React, { Component, PropTypes } from 'react'
import styles from './CurrencyField.css'

import Currency from '../Currency'

class CurrencyField extends Component {
  static propTypes = {
    amount: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onEnter: PropTypes.func,
    onBlur: PropTypes.func,
    max: PropTypes.number
  }

  static defaultProps = {
    max: 99999
  }

  _handleKeyDown = (e) => {
    const { which } = e
    const { onEnter, onChange, max } = this.props
    const char = String.fromCharCode(which)
    let amount = (this.props.amount + '')

    e.preventDefault()

    if (which === 8) {
      amount = amount.substr(0, amount.length - 1)

    } else if (char.match(/^\d+$/)) {
      amount = amount + char

      if (parseInt(amount, 10) > max) {
        return
      }

    } else {
      if (which === 13 && onEnter) {
        onEnter()
      }

      return
    }

    amount = parseInt(amount, 10) || 0
    onChange(amount)
  }

  focus = () => {
    this.input.focus()
  }

  render() {
    const {
      amount,
      className,
      onBlur
    } = this.props

    return (
      <span className={className} onClick={this.focus}>
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
