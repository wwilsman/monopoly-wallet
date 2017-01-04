import React, { Component, PropTypes } from 'react'
import s from './TokenSelect.scss'

import { View, Text, Icon, Label } from '../../common'

class TokenSelect extends Component {
  static propTypes = {
    tokens: PropTypes.array.isRequired,
    selected: PropTypes.string,
    usedTokens: PropTypes.array,
    onChange: PropTypes.func
  }

  state = {
    selected: this.props.selected || ''
  }

  componentWillReceiveProps({ selected = '' }) {
    this.setState({ selected })
  }

  selectToken = (token) => {
    this.setState({ selectedToken: token })

    if (this.props.onChange) {
      this.props.onChange(token)
    }
  }

  renderTokenOption = (token, i) => {
    const { selected } = this.state
    const isDisabled = this.props.usedTokens.indexOf(token) !== -1
    const isSelected = token === selected

    const tileClass = [
      s.tile,
      (isDisabled && s.disabled),
      (isSelected ? s.active : (!!selected && s.notActive))
    ]

    return (
      <View key={token} className={s.cell}>
        <View className={tileClass}
              onClick={() => !isDisabled && this.selectToken(token)}>
          <Icon name={token} className={s.icon}/>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View className={s.grid}>
        {this.props.tokens.map(this.renderTokenOption)}
      </View>
    )
  }
}

export default TokenSelect
