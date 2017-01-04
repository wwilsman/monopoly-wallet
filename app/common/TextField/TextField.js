import React, { Component } from 'react'
import s from './TextField.scss'

import View from '../View'
import Label from '../Label'

class TextField extends Component {
  state = {
    hasFocus: false
  }

  componentDidUpdate() {
    const { hasFocus } = this.state
    const isActive = (this.input === document.activeElement)

    if (hasFocus && !isActive) {
      this.input.focus()
    } else if (!hasFocus && isActive) {
      this.input.blur()
    }
  }

  _handleChange = ({ target: { value } }) => {
    const { onChangeText } = this.props
    onChangeText && onChangeText(value)
  }

  focus = () => this.setState({ hasFocus: true })
  blur = () => this.setState({ hasFocus: false })

  render() {
    const { value, label } = this.props
    const { hasFocus } = this.state
    const isEmpty = !(hasFocus || !!value)

    return (
      <View className={s.root}>
        <Label className={[s.label, (isEmpty && s.floatingLabel)]}>
          {label}
        </Label>

        <input
            ref={(r) => this.input = r}
            className={s.input}
            value={value}
            onChange={this._handleChange}
            onFocus={this.focus}
            onBlur={this.blur}
        />
      </View>
    )
  }
}

export default TextField
