import React, { Component, PropTypes } from 'react'
import { View, Text, StyleSheet } from 'react-native'

import {
  Container,
  Header,
  Title,
  Content,
  Footer
} from '../layout'

import {
  Icon,
  Button
} from '../core/components'

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

  renderFooter() {
    let { player, currentPlayer } = this.props

    if (player === currentPlayer) {
      return (
        <Footer>
          <Button onPress={() => console.log('collect money')}>
            Collect
          </Button>
          <Button onPress={() => console.log('pay bank')}>
            Pay
          </Button>
        </Footer>
      )
    }

    return (
      <Footer>
        <Button onPress={() => console.log(`message ${player.name}`)}>
          Message
        </Button>
        <Button onPress={() => console.log(`trade ${player.name}`)}>
          Trade
        </Button>
      </Footer>
    )
  }

  render() {
    let { player, currentPlayer, properties } = this.props
    let { listView, activeProperty, headerHeight } = this.state

    if (!player) return null

    let fixedBalance = player.balance.toFixed()
      .replace(/(\d)(?=(\d{3})+$)/g, '$1,')

    return (
      <Container>
        <Header
            style={styles.header}
            onLayout={this._getHeaderHeight}>
          <Title style={styles.title}>
            {player === currentPlayer ? 'You' : player.name}
          </Title>

          <Text style={styles.balance}>
            <Icon name="currency"/>
            {fixedBalance}
          </Text>
        </Header>

        {listView ? (
          <PropertyList
            style={styles.propertyList}
            properties={properties}
            start={activeProperty}
            offset={headerHeight}
          />
        ) : (
          <View style={{ flex: 1 }}>
            <Content>
              <PropertyGrid
                properties={properties}
                onGroupPress={this.goToListView}
              />
            </Content>

            {this.renderFooter()}
          </View>
        )}
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center'
  },
  title: {
    marginBottom: 10
  },
  balance: {
    fontSize: 24,
    fontFamily: 'futura',
    color: 'rgb(100,200,100)',
    alignItems: 'center'
  },
  propertyList: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 0,
    left: 0
  }
})
