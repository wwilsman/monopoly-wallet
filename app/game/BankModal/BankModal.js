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
    onCollect: PropTypes.func.isRequired,
    initial: PropTypes.number
  }

  static defaultProps = {
    initial: 0
  }

  state = {
    isPaying: this.props.type === 'pay',
    isInitial: !!this.props.initial,
    amount: this.props.initial
  }

  componentDidMount() {
    this.input.focus()
  }

  componentWillReceiveProps({ type }) {
    this.setState({
      isPaying: type === 'pay'
    })
  }

  _handleConfirmAmount = () => {
    const { onPayBank, onCollect } = this.props
    const { isPaying, amount } = this.state

    if (amount) {
      if (isPaying) {
        onPayBank(amount)
      } else {
        onCollect(amount)
      }
    }
  }

  _handleChangeAmount = (amount, e) => {
    if (e.which !== 8 && this.state.isInitial) {
      amount = amount % 10
    }

    this.setState({
      isInitial: false,
      amount
    })
  }

  render() {
    const { onClose } = this.props
    const { isPaying, amount } = this.state

    return (
      <Modal onClose={onClose}>
        <Flex className={styles.input}>
          <Label center>Amount</Label>

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
