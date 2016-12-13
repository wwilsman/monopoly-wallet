import React from 'react'

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native'

const Button = (props) => {
  let containerProps = {
    activeOpacity: 1
  }

  if (!props.disabled) {
    containerProps.onPress = props.onPress
    containerProps.onPressIn = props.onPressIn
    containerProps.onPressOut = props.onPressOut
    containerProps.onLongPress = props.onLongPress
    containerProps.activeOpacity = props.activeOpacity || 0.2
  }

  let containerStyle = [
    styles.container, props.disabled ? styles.disabledContainer : null,
    props.style, props.disabled ? props.disabledStyle : null
  ]

  let textStyle = [
    styles.text,
    props.textStyle, props.disabled ? props.disabledTextStyle : null,
    props.secondary ? styles.secondaryText : null
  ]

  return (
    <View style={containerStyle}>
      <TouchableOpacity
          {...containerProps}
          accessibilityTraits="button"
          accessibilityComponentType="button">
        <Text style={textStyle}>
          {props.children}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default Button

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5
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
    opacity: 0.6
  }
})
