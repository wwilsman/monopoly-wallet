import React, { Component, PropTypes } from 'react'
import className from 'classnames/bind'
import styles from './Stepper.css'

const cx = className.bind(styles)

import { Flex } from '../../layout'
import { Button } from '../../common'

class Stepper extends Component {
  static propTypes = {
    input: PropTypes.number.isRequired,
    onStep: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    max: PropTypes.number,
    min: PropTypes.number
  }

  static defaultProps = {
    max: 99999,
    min: 0
  }

  frequency = 0

  componentWillReceiveProps({ input, min, max, onStep }) {
    if (input < min) {
      onStep(min)
    }
  }

  getStep() {
    const { input } = this.props
    const count = this.frequency += 1

    if (this._timeout) {
      clearTimeout(this._timeout)
    }

    this._timeout = setTimeout(() => {
      this.frequency = 0
    }, 500)

    let step = 1

    if (count >= 25) {
      step = 100
    } else if (count >= 20) {
      step = 50
    } else if (count >= 10) {
      step = 10
    } else if (count >= 5) {
      step = 5
    }

    return step
  }

  _handleIncrement = () => {
    if (this.props.disabled) return

    const { input, max, onStep } = this.props
    const step = this.getStep()
    const rounded = (Math.ceil(input / step) + 1) * step

    onStep(Math.min(rounded, max))
  }

  _handleDecrement = () => {
    if (this.props.disabled) return

    const { input, min, onStep } = this.props
    const step = this.getStep()
    const rounded = (Math.floor(input / step) - 1) * step

    onStep(Math.max(rounded, min))
  }

  render() {
    const {
      min,
      max,
      input,
      disabled,
      className
    } = this.props

    return (
      <Flex
          row
          align="center"
          justify="stretch"
          className={styles.root}>
        <Button
            className={styles.decrement}
            onClick={this._handleDecrement}
            disabled={disabled || input <= min}
            tiny
        />

        <Flex
            justify="center"
            className={cx('center', {
                'is-disabled': disabled
              }, className)}>
          {this.props.children}
        </Flex>

        <Button
            className={styles.increment}
            onClick={this._handleIncrement}
            disabled={disabled || input >= max}
            tiny
        />
      </Flex>
    )
  }
}

export default Stepper
