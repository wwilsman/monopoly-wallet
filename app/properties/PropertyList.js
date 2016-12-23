import React, { Component } from 'react'

import {
  View,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet
} from 'react-native'

import { PropertyCard } from './components'

export default class PropertyList extends Component {
  panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (e, { dx, dy }) => {
      return Math.abs(dy) > Math.abs(dx)
    },
    onPanResponderMove: (e, { dy }) => {
      let rel = dy / (this.getCardWidth() * 1.5)
      this.state.anim.setValue(this.state.index - rel)
    },
    onPanResponderRelease: (e, { dy, vy }) => {
      let { properties, onUpdate } = this.props
      let rel = dy / (this.getCardWidth() * 1.5)
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
          onUpdate ? onUpdate(index) :
            this.setState({ index })
        }
      })
    }
  })

  constructor(props) {
    super(props)

    let cardWidth = Dimensions.get('window').width - 120
    let cardHeight = cardWidth * 1.5

    this.state = {
      index: props.index,
      anim: new Animated.Value(props.index),
      cardWidth,
      cardHeight
    }
  }

  componentWillReceiveProps(props) {
    this.setState({ index: props.index })
  }

  componentDidUpdate() {
    this.state.anim.setValue(this.state.index)
  }

  getPropertyStyle(i) {
    let { offset } = this.props
    let cardHeight = this.getCardWidth() * 1.5
    let space = cardHeight + 20
    let overlap = cardHeight * 0.1

    let top = this.state.anim.interpolate({
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

  getCardWidth() {
    return Dimensions.get('window').width - 120
  }

  render() {
    let { properties, cardsToShow } = this.props
    let startIndex = this.state.index + cardsToShow + 2
    let endIndex = this.state.index - 1
    let cardWidth = this.getCardWidth()

    return (
      <View
          style={styles.container}
          onTouchMove={(e) => e.preventDefault()}
          {...this.panResponder.panHandlers}>
        {properties.map((p, i) => {
          if (i <= startIndex && i >= endIndex) {
            return (
              <Animated.View key={i}
                  style={[styles.property, this.getPropertyStyle(i)]}>
                <PropertyCard width={cardWidth} property={p}/>
              </Animated.View>
            )
          }
        })}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 0,
    left: 0
  },
  property: {
    width: '100%',
    position: 'absolute',
    paddingLeft: 60,
    paddingRight: 60
  }
})
