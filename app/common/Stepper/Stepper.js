import React, { Component, PropTypes } from 'react'
import styles from './Stepper.css'

class Stepper extends Component {
  static propTypes = {
    input: PropTypes.number.isRequired,
    onStep: PropTypes.func.isRequired,
    max: PropTypes.number
  }

  static defaultProps = {
    max: 99999
  }

  frequency = 0

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
    const { input, max, onStep } = this.props
    const step = this.getStep()
    const rounded = (Math.ceil(input / step) + 1) * step

    onStep(Math.min(rounded, max))
  }

  _handleDecrement = () => {
    const { input, onStep } = this.props
    const step = this.getStep()
    const rounded = (Math.floor(input / step) - 1) * step

    onStep(Math.max(rounded, 0))
  }

  render() {
    const { className } = this.props

    return (
      <div className={[styles.root, className].join(' ')}>
        <div className={styles.decrement}
             onClick={this._handleDecrement}/>

        <div className={styles.center}>
          {this.props.children}
        </div>

        <div className={styles.increment}
             onClick={this._handleIncrement}/>
      </div>
    )
  }
}

export default Stepper
