import React, { Component, PropTypes } from 'react'
import { Animated, PanResponder } from '../core/apis'

import { View } from '../core/components'
import { PropertyCard } from './components'

class PropertyList extends Component {
  static propTypes = {
    properties: PropTypes.array.isRequired,
    cardsToShow: PropTypes.number.isRequired,
    index: PropTypes.number,
    onChange: PropTypes.func,
    style: PropTypes.object
  }

  state = {
    index: this.props.index || 0,
    anim: new Animated.Value(this.props.index || 0)
  }

  panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (e, { dx, dy }) => {
      return Math.abs(dy) > Math.abs(dx)
    },

    onPanResponderMove: (e, { dy }) => {
      let rel = dy / (this.getCardWidth() * 1.5)
      this.state.anim.setValue(this.state.index - rel)
    },

    onPanResponderRelease: (e, { dy, vy }) => {
      let { properties, onChange } = this.props
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
          onChange ? onChange(index) : this.setState({ index })
        }
      })
    }
  })

  componentWillReceiveProps(props) {
    this.setState({ index: props.index || 0 })
  }

  componentDidUpdate() {
    this.state.anim.setValue(this.state.index)
  }

  getVisibleProperties() {
    let { properties, cardsToShow } = this.props
    let { index } = this.state

    let startIndex = index - 2
    let endIndex = index + cardsToShow + 2

    return properties.reduce((visible, p, i) => {
      if (startIndex <= i && i <= endIndex) {
        visible.push({
          property: p,
          style: this.getPropertyStyle(i)
        })
      }

      return visible
    }, [])
  }

  getPropertyStyle(i) {
    let { offset, properties } = this.props
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

    return { top }
  }

  getCardWidth() {
    return window.innerWidth - 120
  }

  getCardWidth() {
    return Dimensions.get('window').width - 120
  }

  render() {
    let { style } = this.props
    let cardWidth = this.getCardWidth()

    return (
      <View
          style={{ ...styles.container, ...style }}
          onTouchMove={(e) => e.preventDefault()}
          {...this.panResponder.panHandlers}>
        {this.getVisibleProperties().map((p) => (
           <Animated.View
               key={p.property._id}
               style={{ ...styles.property, ...p.style }}>
             <PropertyCard width={cardWidth} property={p.property}/>
           </Animated.View>
         ))}
      </View>
    )
  }
}

const styles = {
  container: {
    overflow: 'hidden',
    pointerEvents: 'none'
  },
  property: {
    position: 'absolute',
    pointerEvents: 'auto',
    paddingLeft: 60,
    paddingRight: 60
  }
}

export default PropertyList
