import React, { Component } from 'react'
import { View, Animated, PanResponder, Dimensions, StyleSheet } from 'react-native'

import { PropertyCard } from './components'

export default class PropertyList extends Component {
  state = {
    index: this.props.start,
    anim: new Animated.Value(this.props.start),
    cardHeight: 0,
    viewHeight: 0
  }

  panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (e, { dx, dy }) => {
      return Math.abs(dy) > Math.abs(dx)
    },
    onPanResponderMove: (e, { dy }) => {
      let rel = dy / this.state.cardHeight
      this.state.anim.setValue(this.state.index - rel)
    },
    onPanResponderRelease: (e, { dy, vy }) => {
      let { properties } = this.props
      let rel = dy / this.state.cardHeight
      let index = parseInt(Math.round(this.state.index - rel))

      let quickSwipeUp = rel < 0.5 && vy > 1
      let quickSwipeDown = rel > -0.5 && vy < -1
      let swipedBack = (rel > 0.5 && vy < -0.2) || (rel < -0.5 && vy > 0.2)

      if (quickSwipeUp && !swipedBack) {
        index = this.state.index - 1
      } else if (quickSwipeDown && !swipedBack) {
        index = this.state.index + 1
      } else if (swipedBack) {
        index = this.state.index
      }

      index = Math.min(Math.max(index, 0), properties.length - 1)

      Animated.timing(this.state.anim, {
        toValue: index,
        duration: 200
      }).start(() => {
        if (this.state.index !== index) {
          this.setState({ index })
        }
      })
    }
  })

  componentWillReceiveProps(props) {
    this.setState({ index: props.start })
  }

  componentDidUpdate() {
    this.state.anim.setValue(this.state.index)
  }

  _getCardHeight = ({ nativeEvent: { layout: { height } } }) => {
    if (height !== this.cardHeight) {
      this.setState({ cardHeight: height })
    }
  }

  _getViewHeight = ({ nativeEvent: { layout: { height } } }) => {
    if (height !== this.viewHeight) {
      this.setState({ viewHeight: height })
    }
  }

  getPropertyStyle(i) {
    let { offset } = this.props
    let { anim, cardHeight } = this.state

    let space = cardHeight + 20
    let overlap = cardHeight * 0.1

    let top = anim.interpolate({
      inputRange: [i - 2, i - 1, i, i + 1],
      outputRange: [
        offset + space + overlap,
        offset + space,
        offset,
        -space
      ]
    })

    return {
      transform: [{ translateY: top }]
    }
  }

  render() {
    let { style, properties } = this.props
    let { cardHeight } = this.state

    return (
      <View
          style={[styles.container, style]}
          onTouchMove={(e) => e.preventDefault()}
          {...this.panResponder.panHandlers}>
        {properties.map((p, i) => (
          <Animated.View key={i}
              style={[styles.property, this.getPropertyStyle(i)]}>
            <PropertyCard
              onLayout={this._getCardHeight}
              property={p}
            />
          </Animated.View>
        ))}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden'
  },
  property: {
    width: '100%',
    position: 'absolute',
    paddingLeft: 40,
    paddingRight: 40
  }
})
