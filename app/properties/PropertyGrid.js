import React, { Component } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'

import { PropertyGroup } from './components'

export default class PropertyGrid extends Component {
  state = {
    groupStyle: {}
  }

  render() {
    let { properties, onGroupPress } = this.props
    let { groupStyle } = this.state

    let groups = this.groupProperties(properties)

    return (
      <View
          style={styles.container}
          onLayout={this._updateStyles}>
        {groups.map((properties, i) => (
          <TouchableOpacity key={i}
              style={[styles.group, groupStyle]}
              onPress={() => onGroupPress(properties[0]._id)}>
            <View>
              <PropertyGroup
                properties={properties}
                simple
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  _updateStyles = ({ nativeEvent: { layout: { width } } }) => {
    this.setState({
      groupStyle: {
        width: (width / 4) - 30
      }
    })
  }

  groupProperties(properties) {
    let groups = []
    let grouped = {}

    properties.forEach((p) => {
      if (!grouped[p.group]) {
        groups.push(p.group)
      }

      grouped[p.group] = grouped[p.group] || []
      grouped[p.group].push(p)
    })

    return groups.map((g) => grouped[g])
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginRight: -15,
    marginLeft: -15
  },
  group: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 30
  }
})
