import React, { Component, PropTypes } from 'react'
import className from 'classnames/bind'
import styles from './BankModal.css'

const cx = className.bind(styles)

import { Flex, Label } from '../../layout'
import { Button, CurrencyField, Modal } from '../../common'

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

  _handleConfirmAmount = () => {
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

  _handleChangeAmount = (amount) => {
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
              onChange={this._handleChangeAmount}
              onEnter={this._handleConfirmAmount}
              onBlur={() => this.input.focus()}
              amount={amount}
              className={cx('amount', {
                  'is-negative': isPaying
                })}
          />
        </Flex>

        <Flex direction="row">
          <Button
              onClick={this._handleConfirmAmount}
              color={isPaying ? 'red' : 'green'}
              disabled={!amount}
              width="full">
            {isPaying ? 'Pay Bank' : 'Collect'}
          </Button>
        </Flex>
      </Modal>
    )
  }
}

export default BankModal
