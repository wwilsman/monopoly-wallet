import React, { Component, PropTypes } from 'react'
import s from './ThemeSelect.scss'

import { View, Text, Label } from '../../common'

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
    const isSelected = theme._id === this.state.selected

    return (
      <View key={theme._id} className={[s.tile, (isSelected && s.active)]}>
        <View onClick={() => this.selectTheme(theme)}>
          <Text className={s.heading}>{theme.name}</Text>
          <Text className={s.description}>{theme.description}</Text>
        </View>
      </View>
    )
  }

  render() {
    const { themes } = this.props

    return (
      <View>
        <Label>Choose A Theme</Label>

        <View>
          {themes.map(this.renderThemeOption)}
        </View>
      </View>
    )
  }
}

export default ThemeSelect
