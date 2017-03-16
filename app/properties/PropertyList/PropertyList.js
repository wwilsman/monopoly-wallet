import React, { Component, PropTypes } from 'react'
import Animated from 'animated/lib/targets/react-dom'
import PanResponder from '../../apis/PanResponder'
import styles from './PropertyList.css'

import { Flex } from '../../layout'

import PropertyCard from '../PropertyCard'
import PropertyInfo from '../PropertyInfo'

class PropertyList extends Component {
  static propTypes = {
    properties: PropTypes.array.isRequired,
    activeProperty: PropTypes.object,
    onChange: PropTypes.func
  }

  state = {
    index: this.props.activeProperty ?
           this.props.properties.indexOf(this.props.activeProperty) : 0
  }

  anim = new Animated.Value(this.state.index)

  panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (e, { dx, dy }) => {
      return Math.abs(dx) > Math.abs(dy)
    },

    onPanResponderMove: (e, { dx }) => {
      const rel = dx / window.innerWidth
      this.anim.setValue(this.state.index - rel)
    },

    onPanResponderRelease: (e, { dx, vx }) => {
      const { properties, onChange } = this.props
      const rel = dx / window.innerWidth

      const quickSwipeUp = rel < 0.5 && vx > 1
      const quickSwipeDown = rel > -0.5 && vx < -1
      const swipedBack = (rel > 0.5 && vx < -0.2) || (rel < -0.5 && vx > 0.2)

      let index = parseInt(Math.round(this.state.index - rel))

      if (quickSwipeUp && !swipedBack) {
        index = this.state.index - 1
      } else if (quickSwipeDown && !swipedBack) {
        index = this.state.index + 1
      } else if (swipedBack) {
        index = this.state.index
      }

      this.setIndex(index)
    }
  })

  componentWillReceiveProps(props) {
    if (props.activeProperty !== this.props.activeProperty) {
      this.setState({
        index: props.properties.indexOf(props.activeProperty)
      })
    }
  }

  componentDidUpdate() {
    this.anim.setValue(this.state.index)
  }

  setIndex(index) {
    index = Math.min(Math.max(index, 0), this.props.properties.length - 1)

    Animated.timing(this.anim, {
      toValue: index,
      duration: 200
    }).start(() => {
      if (index !== this.state.value) {
        this.setState({ index })

        if (this.props.onChange) {
          this.props.onChange(this.props.properties[index])
        }
      }
    })
  }

  render() {
    const { properties, className } = this.props
    const { index } = this.state

    return (
      <Flex className={styles.root} {...this.panResponder.panHandlers}>
        {properties.map((property, i) => (i > index - 3 && i < index + 3) && (
           <Animated.div
               key={property.name}
               className={styles.property}
               style={{
                 left: this.anim.interpolate({
                   inputRange: [i - 2, i, i + 2],
                   outputRange: ['195%', '50%', '-95%']
                 })
               }}>
             <PropertyInfo property={property}>
               <PropertyCard property={property}/>
             </PropertyInfo>
           </Animated.div>
         ))}
      </Flex>
    )
  }
}

export default PropertyList
