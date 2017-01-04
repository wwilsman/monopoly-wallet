import React, { Component, PropTypes } from 'react'
import { Animated, PanResponder } from '../../apis'
import { formatCurrency } from '../../utils'
import s from './PropertyList.scss'

import { View } from '../../common'
import PropertyCard from '../PropertyCard'

const cardHeight = 375 // 250px width * 1.5

class PropertyList extends Component {
  static propTypes = {
    properties: PropTypes.array.isRequired,
    active: PropTypes.object,
    onChange: PropTypes.func
  }

  panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (e, { dx, dy }) => {
      return Math.abs(dy) > Math.abs(dx)
    },

    onPanResponderMove: (e, { dy }) => {
      const rel = dy / cardHeight
      this.state.anim.setValue(this.state.index - rel)
    },

    onPanResponderRelease: (e, { dy, vy }) => {
      const { properties, onChange } = this.props
      const rel = dy / cardHeight

      const quickSwipeUp = rel < 0.5 && vy > 1
      const quickSwipeDown = rel > -0.5 && vy < -1
      const swipedBack = (rel > 0.5 && vy < -0.2) || (rel < -0.5 && vy > 0.2)

      let index = parseInt(Math.round(this.state.index - rel))

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
          onChange ? onChange(properties[index]) : this.setState({ index })
        }
      })
    }
  })

  constructor(props) {
    super(props)

    const index = props.active ? props.properties.indexOf(props.active) : 0
    const anim = new Animated.Value(index)

    this.state = { index, anim }
  }

  componentWillReceiveProps(props) {
    if (props.active !== this.props.active) {
      this.setState({
        index: props.properties.indexOf(props.active)
      })
    }
  }

  componentDidUpdate() {
    this.state.anim.setValue(this.state.index)
  }

  getVisibleProperties() {
    const { properties } = this.props
    const { index } = this.state
    const cardsToShow = Math.ceil((window.innerHeight * 0.1) / (cardHeight * 0.1))

    const startIndex = index - 2
    const endIndex = index + cardsToShow + 2

    return properties.reduce((visible, p, i) => {
      if (startIndex <= i && i <= endIndex) {
        visible.push(p)
      }

      return visible
    }, [])
  }

  getPropertyStyle(property) {
    const i = this.props.properties.indexOf(property)
    const space = window.innerHeight * 0.9
    const offset = (space - cardHeight) / 2
    const overlap = cardHeight * 0.1
    const height = cardHeight + offset

    const top = this.state.anim.interpolate({
      inputRange: [i - 2, i - 1, i, i + 1],
      outputRange: [space + overlap, space, offset, -height]
    })

    return { top, height }
  }

  render() {
    return (
      <View className={s.root} {...this.panResponder.panHandlers}>
        {this.getVisibleProperties().map((p) => (
           <Animated.View
               key={p._id}
               className={s.property}
               style={this.getPropertyStyle(p)}>
             <PropertyCard className={s.card} property={p}/>
           </Animated.View>
         ))}
      </View>
    )
  }
}

export default PropertyList
