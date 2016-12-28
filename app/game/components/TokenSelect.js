import React, { Component, PropTypes } from 'react'

import { View, Text, Icon } from '../../core/components'

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
    let isDisabled = this.props.usedTokens.indexOf(token) !== -1
    let cardStyle = styles.card
    let iconStyle = styles.icon

    if (isDisabled) {
      cardStyle = { ...cardStyle, ...styles.disabledCard }
    }

    if (token === this.state.selected) {
      cardStyle = { ...cardStyle, ...styles.activeCard }
      iconStyle = { ...iconStyle, ...styles.activeIcon }
    }

    return (
      <View key={token} style={styles.cardContainer}>
        <View style={cardStyle} onClick={() => !isDisabled && this.selectToken(token)}>
          <Icon name={token} style={iconStyle}/>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.grid}>
        {this.props.tokens.map(this.renderTokenOption)}
      </View>
    )
  }
}

const styles = {
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -10
  },
  card: {
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
  },
  cardContainer: {
    width: '33.333%',
    padding: 10
  },
  activeCard: {
    backgroundColor: 'rgb(100,200,100)'
  },
  disabledCard: {
    opacity: 0.2
  },
  icon: {
    textAlign: 'center',
    color: '#BBBBBB',
    fontSize: 40
  },
  activeIcon: {
    color: 'white'
  }
}

export default TokenSelect
