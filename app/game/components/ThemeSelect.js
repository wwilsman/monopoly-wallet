import React, { Component, PropTypes } from 'react'

import { View, Text } from '../../core/components'

class ThemeSelect extends Component {
  static propTypes = {
    themes: PropTypes.array.isRequired,
    selected: PropTypes.string,
    onChange: PropTypes.func
  }

  state = {
    selected: this.props.selected || ''
  }

  componentWillReceiveProps(props) {
    this.setState({ selected: props.selected || '' })
  }

  selectTheme = (theme) => {
    this.setState({ selected: theme._id })

    if (this.props.onChange) {
      this.props.onChange(theme._id)
    }
  }

  renderThemeOption = (theme) => {
    let cardStyle = styles.card
    let titleStyle = styles.title
    let descrStyle = styles.descr

    if (theme._id === this.state.selected) {
      cardStyle = { ...cardStyle, ...styles.activeCard }
      titleStyle = { ...titleStyle, ...styles.activeText }
      descrStyle = { ...descrStyle, ...styles.activeText }
    }

    return (
      <View key={theme._id} style={cardStyle}>
        <View onClick={() => this.selectTheme(theme)}>
          <Text style={titleStyle}>{theme.name}</Text>
          <Text style={descrStyle}>{theme.description}</Text>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View>
        {this.props.themes.map(this.renderThemeOption)}
      </View>
    )
  }
}

const styles = {
  card: {
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingTop: 20,
    paddingRight: 30,
    paddingBottom: 20,
    paddingLeft: 30,
    marginBottom: 20
  },
  activeCard: {
    backgroundColor: 'rgb(100,200,100)'
  },
  activeText: {
    color: 'white'
  },
  title: {
    fontFamily: 'Futura',
    fontSize: 20,
    marginBottom: 5,
    color: '#CCCCCC'
  },
  descr: {
    fontFamily: 'Futura',
    fontSize: 13,
    color: '#CCCCCC'
  }
}

export default ThemeSelect
