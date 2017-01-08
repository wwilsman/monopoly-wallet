import React, { Component, PropTypes } from 'react'

import { Container, Content } from '../../common'
import { PropertyList, PropertyGrid } from '../../properties'

class Player extends Component {
  static propTypes = {
    player: PropTypes.object.isRequired
  }

  state = {
    isListView: false,
    activeProperty: null
  }

  viewPropertyGroup = (properties) => {
    this.setState({
      isListView: true,
      activeProperty: properties[0]
    })
  }

  activateProperty = (activeProperty) => {
    this.setState({ activeProperty })
  }

  render() {
    const { player, properties } = this.props
    const { isListView, activeProperty } = this.state

    return (
      <Container>
        <Content centered>
          {isListView ? (
             <PropertyList
                 properties={properties}
                 active={activeProperty}
                 onChange={this.activateProperty}
             />
           ) : (
             <PropertyGrid
                 properties={properties}
                 onGroupPress={this.viewPropertyGroup}
             />
           )}
        </Content>
      </Container>
    )
  }
}

export default Player
