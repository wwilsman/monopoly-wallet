import React, { Component, PropTypes } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

export class Button extends Component {
  static propTypes = {
    ...TouchableOpacity.propTypes,
    style: View.propTypes.style,
    disabledStyle: View.propTypes.style,
    textStyle: Text.propTypes.style,
    disabledTextStyle: Text.propTypes.style,
    disabled: PropTypes.bool,
    secondary: PropTypes.bool
  }

  render() {
    let containerProps = {
      activeOpacity: 1
    }

    if (!this.props.disabled) {
      containerProps.onPress = this.props.onPress
      containerProps.onPressIn = this.props.onPressIn
      containerProps.onPressOut = this.props.onPressOut
      containerProps.onLongPress = this.props.onLongPress
      containerProps.activeOpacity = this.props.activeOpacity || 0.2
    }

    let containerStyle = [
      styles.container, this.props.disabled ? styles.disabledContainer : null,
      this.props.style, this.props.disabled ? this.props.disabledStyle : null
    ]

    let textStyle = [
      styles.text,
      this.props.textStyle, this.props.disabled ? this.props.disabledTextStyle : null,
      this.props.secondary ? styles.secondaryText : null
    ]

    return (
      <View style={containerStyle}>
        <TouchableOpacity
            {...containerProps}
            accessibilityTraits="button"
            accessibilityComponentType="button">
          <Text style={textStyle}>
            {this.props.children}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4
  },
  disabledContainer: {
    opacity: 0.2
  },
  text: {
    fontFamily: 'Futura',
    fontSize: 16,
    color: 'white'
  },
  secondaryText: {
    color: '#AAAAAA'
  }
})
