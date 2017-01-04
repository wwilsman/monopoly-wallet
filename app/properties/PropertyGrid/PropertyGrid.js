import React, { Component, PropTypes } from 'react'
import s from './PropertyGrid.scss'

import { View } from '../../common'
import PropertyGroup from '../PropertyGroup'

class PropertyGrid extends Component {
  static propTypes = {
    properties: PropTypes.array.isRequired,
    onGroupPress: PropTypes.func
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

  render() {
    const { properties, onGroupPress } = this.props
    const groups = this.groupProperties(properties)

    return (
      <View className={s.root}>
        <View className={s.grid}>
          {groups.map((properties, i) => (
            <View key={properties[0].group}
                  className={s.cell}
                  onClick={() => onGroupPress(properties)}>
              <PropertyGroup
                properties={properties}
                simple/>
            </View>
          ))}
        </View>
      </View>
    )
  }
}

export default PropertyGrid
