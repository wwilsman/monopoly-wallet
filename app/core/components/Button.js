import React, { Component, PropTypes } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

export const Button = (props) => {
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
