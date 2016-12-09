import React, { Component, PropTypes } from 'react'
import { StyleSheet, Text, View, ListView, TouchableHighlight } from 'react-native'

export class ThemeSelect extends Component {
  static propTypes = {
    themes: PropTypes.array.isRequired,
    selectedTheme: PropTypes.string,
    onChange: PropTypes.func
  }

  constructor(props) {
    super(props)

    this.ds = new ListView.DataSource({
      rowHasChanged(prev, next) {
        return JSON.stringify(prev) !== JSON.stringify(next)
      }
    })

    this.state = {
      themes: this.ds.cloneWithRows(props.themes),
      selectedTheme: props.selectedTheme || ''
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      themes: this.ds.cloneWithRows(props.themes),
      selectedTheme: props.selectedTheme || ''
    })
  }

  render() {
    return (
      <ListView
        style={styles.list}
        dataSource={this.state.themes}
        renderRow={this.renderThemeOption}
      />
    )
  }

  selectTheme = (theme) => {
    this.setState({ selectedTheme: theme._id })

    if (this.props.onChange) {
      this.props.onChange(theme._id)
    }
  }

  renderThemeOption = (theme) => {
    let isSelected = theme._id === this.state.selectedTheme

    let cardStyle = [styles.card, isSelected ? styles.activeCard : null]
    let titleStyle = [styles.title, isSelected ? styles.activeText : null]
    let descrStyle = [styles.descr, isSelected ? styles.activeText : null]

    return (
      <View style={cardStyle}>
        <TouchableHighlight onPress={() => this.selectTheme(theme)}>
          <View>
            <Text style={titleStyle}>{theme.name}</Text>
            <Text style={descrStyle}>{theme.description}</Text>
          </View>
        </TouchableHighlight>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1
  },
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
})
