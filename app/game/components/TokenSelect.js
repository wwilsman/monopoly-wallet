import React, { Component, PropTypes } from 'react'
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native'

import { Icon } from '../../core/components'

export class TokenSelect extends Component {
  static propTypes = {
    tokens: PropTypes.array.isRequired,
    selectedToken: PropTypes.string,
    usedTokens: PropTypes.array,
    onChange: PropTypes.func
  }

  constructor(props) {
    super(props)

    this.renderTokenOption = this.renderTokenOption.bind(this)
    this.selectToken = this.selectToken.bind(this)

    this.state = {
      selectedToken: props.selectedToken || ''
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      selectedToken: props.selectedToken || ''
    })
  }

  selectToken(token) {
    this.setState({ selectedToken: token })

    if (this.props.onChange) {
      this.props.onChange(token)
    }
  }

  renderTokenOption(token, i) {
    let isSelected = token === this.state.selectedToken
    let isDisabled = this.props.usedTokens.indexOf(token) !== -1

    let cardStyle = [
      styles.card,
      isSelected ? styles.activeCard : null,
      isDisabled ? styles.disabledCard : null
    ]

    let iconStyle = [
      styles.icon,
      isSelected ? styles.activeIcon : null
    ]

    return (
      <View style={styles.cardContainer} key={i}>
        <TouchableHighlight disabled={isDisabled}
            onPress={() => this.selectToken(token)}>
          <View style={cardStyle}>
            <Icon name={token} style={iconStyle}/>
          </View>
        </TouchableHighlight>
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

const styles = StyleSheet.create({
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
})
