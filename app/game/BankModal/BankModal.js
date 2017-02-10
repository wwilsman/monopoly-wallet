import React, { Component, PropTypes } from 'react'
import className from 'classnames/bind'
import styles from './BankModal.css'

const cx = className.bind(styles)

import { Flex, Label } from '../../layout'
import { CurrencyField, Modal, Button } from '../../common'

class BankModal extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['collect', 'pay']).isRequired,
    onClose: PropTypes.func.isRequired,
    onPayBank: PropTypes.func.isRequired,
    onCollect: PropTypes.func.isRequired
  }

  state = {
    amount: 200
  }

  componentDidMount() {
    this.input.focus()
  }

  _payAmount = () => {
    this.props.onPayBank(this.state.amount)
  }

  _confirmAmount = () => {
    const { type, onPayBank, onCollect } = this.props
    const { amount } = this.state

    if (amount) {
      if (type === 'pay') {
        onPayBank(amount)
      } else {
        onCollect(amount)
      }
    }
  }

  _changeAmount = (amount) => {
    this.setState({ amount })
  }

  render() {
    const { onClose, type } = this.props
    const { amount } = this.state

    const isPaying = type === 'pay'

    return (
      <Modal onClose={onClose}>
        <Flex className={styles.input}>
          <Label>Amount</Label>

          <CurrencyField
              ref={(input) => this.input = input}
              amount={amount}
              onChange={this._changeAmount}
              onEnter={this._confirmAmount}
              onBlur={() => this.input.focus()}
              className={cx('amount', {
                  'is-negative': isPaying
                })}
          />
        </Flex>

        <Flex direction="row" justify="space-between">
          <Button
              width="full"
              color={isPaying ? 'red' : 'green'}
              disabled={!amount}
              onClick={this._confirmAmount}>
            {isPaying ? 'Pay Bank' : 'Collect'}
          </Button>
        </Flex>
      </Modal>
    )
  }
}

export default BankModal
