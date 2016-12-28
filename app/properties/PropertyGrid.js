import React, { Component } from 'react'
import { View, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'

import { PropertyGroup } from './components'

export default class PropertyGrid extends Component {
  constructor(props) {
    super(props)

    this.state = {
      groups: this.groupProperties(props.properties)
    }
  }

  componentWillReceiveProps({ properties }) {
    this.setState({
      groups: this.groupProperties(properties)
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

  render() {
    let { onGroupPress } = this.props
    let groupWidth = ((Dimensions.get('window').width - 30) / 4) - 30

    return (
      <View style={styles.container}>
        {this.state.groups.map((properties, i) => (
          <TouchableOpacity key={i}
              style={styles.group}
              onPress={() => onGroupPress(properties[0]._id)}>
            <View>
              <PropertyGroup
                width={groupWidth}
                properties={properties}
                simple
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    )
  }
}

const styles = StyleSheet.create({
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
})
