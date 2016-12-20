import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import PropertyCard from './PropertyCard'

export default class PropertyGroup extends Component {
  state = {
    propertyStyle: 0
  }

  _updateLayout = ({ nativeEvent: { layout: { width } } }) => {
    this.setState({
      propertyStyle: {
        marginTop: width * -1.2
      }
    })
  }

  render() {
    let { properties, simple } = this.props

    return (
      <View>
        {properties.map((p, i) => (
          <PropertyCard key={p._id}
            style={i ? this.state.propertyStyle : null}
            onLayout={this._updateLayout}
            property={p}
            simple={simple}
            index={i}
          />
        ))}
      </View>
    )
  }
}
