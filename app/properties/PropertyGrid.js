import React, { Component, PropTypes } from 'react'

import { View } from '../core/components'
import { PropertyGroup } from './components'


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
    let { properties, onGroupPress } = this.props
    let groups = this.groupProperties(properties)
    let groupWidth = ((window.innerWidth - 30) / 4) - 30

    return (
      <View style={styles.container}>
        {groups.map((properties, i) => (
           <View
               key={properties[0].group}
               style={styles.group}
               onClick={() => onGroupPress(properties)}>
             <PropertyGroup
                 width={groupWidth}
                 properties={properties}
                 simple
             />
           </View>
         ))}
      </View>
    )
  }
}

const styles = {
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingRight: 15,
    paddingLeft: 15
  },
  group: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 30
  }
}

export default PropertyGrid
