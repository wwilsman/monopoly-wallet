import React, { Component, PropTypes } from 'react'
import { StyleSheet, Text, View, ListView, TouchableHighlight } from 'react-native'

export class ItemSelect extends Component {
  static propTypes = {
    items: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    style: View.propTypes.style,
    itemStyle: View.propTypes.style,
    renderItem: PropTypes.func.isRequired,
    isSelected: PropTypes.func,
    isDisabled: PropTypes.func,
  }

  constructor(props) {
    super(props)

    this.renderItem = this.renderItem.bind(this)

    this.state = {
      selectedItem: props.selectedItem || ''
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      selectedItem: props.selectedItem || ''
    })
  }

  isItemSelected(item, current) {
    if (this.props.isSelected) {
      return this.props.isSelected(item, current)
    }

    return current == item
  }

  isItemDisabled(item) {
    if (this.props.isDisabled) {
      return this.props.isDisabled(item)
    }

    return false
  }

  selectItem(item) {
    this.setState({ selectedItem: item })

    if (this.props.onChange) {
      this.props.onChange(item)
    }
  }

  renderItem(item, i) {
    let isSelected = this.isItemSelected(item, this.state.selectedItem)
    let isDisabled = this.isItemDisabled(item)

    let itemContent = this.props.renderItem(item, { isSelected, isDisabled })

    return (
      <TouchableHighlight key={i}
          style={this.props.itemStyle}
          onPress={() => this.selectItem(item)}>
        {itemContent}
      </TouchableHighlight>
    )
  }

  render() {
    return (
      <View style={this.props.style}>
        {this.props.items.map(this.renderItem)}
      </View>
    )
  }
}
