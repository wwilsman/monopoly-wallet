import React, { Component, PropTypes } from 'react'
import { View, StyleSheet } from 'react-native'

import {
  Container,
  Header,
  Title,
  Content
} from '../layout'

import {
  Icon
} from '../core/components'

import {
  PlayerBalance
} from './components'

import {
  PropertyList,
  PropertyGrid
} from '../properties'

export default class Player extends Component {
  state = {
    listView: false,
    activeProperty: null,
    headerHeight: 0
  }

  _getHeaderHeight = ({ nativeEvent: { layout: { height } } }) => {
    if (height !== this.headerHeight) {
      this.setState({ headerHeight: height })
    }
  }

  goToListView = (propertyID) => {
    this.setState({
      listView: true,
      activeProperty: this.props.properties
        .findIndex((p) => p._id === propertyID)
    })
  }

  render() {
    let { player, properties } = this.props
    let { listView, activeProperty, headerHeight } = this.state

    if (!player) return null

    return (
      <Container>
        <Header onLayout={this._getHeaderHeight}>
          <Title>
            <Icon style={styles.playerIcon}
              name={player.token}/>
            {player.name}
          </Title>
        </Header>

        {listView ? (
          <PropertyList
            style={styles.propertyList}
            properties={properties}
            start={activeProperty}
            offset={headerHeight}
          />
        ) : (
          <Content>
            <PlayerBalance
              style={styles.balance}
              balance={player.balance}
            />

            <PropertyGrid
              properties={properties}
              onGroupPress={this.goToListView}
            />
          </Content>
        )}
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  playerIcon: {
    marginRight: 15
  },
  balance: {
    marginBottom: 40
  },
  propertyList: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 0,
    left: 0
  }
})
