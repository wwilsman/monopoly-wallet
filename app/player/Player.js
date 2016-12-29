import React, { Component, PropTypes } from 'react'
import { findDOMNode } from 'react-dom'

import {
  Container,
  Header,
  Title,
  Content,
  Footer
} from '../layout'

import {
  View,
  Text,
  Icon,
  Button
} from '../core/components'

import {
  PropertyList,
  PropertyGrid
} from '../properties'

class Player extends Component {
  static propTypes = {
    player: PropTypes.object.isRequired
  }

  state = {
    isListView: false,
    activeProperty: null,
    headerOffset: 0
  }

  _getHeaderOffset = (header) => {
    let node = null

    if (header && (node = findDOMNode(header))) {
      const offset = node.getBoundingClientRect().bottom

      if (offset !== this.state.headerOffset) {
        this.setState({ headerOffset: offset })
      }
    }
  }

  viewPropertyGroup = (properties) => {
    let pid = properties[0]._id

    this.setState({
      isListView: true,
      activeProperty: this.props.properties.findIndex((p) => p._id === pid)
    })
  }

  activateProperty = (index) => {
    this.setState({ activeProperty: index })
  }

  renderFooter() {
    let { player, currentPlayer } = this.props

    if (player === currentPlayer) {
      return (
        <Footer>
          <Button onClick={() => console.log('collect money')}>
            Collect
          </Button>
          <Button onClick={() => console.log('pay bank')}>
            Pay
          </Button>
        </Footer>
      )
    }

    return (
      <Footer>
        <Button onClick={() => console.log(`message ${player.name}`)}>
          Message
        </Button>
        <Button onClick={() => console.log(`trade ${player.name}`)}>
          Trade
        </Button>
      </Footer>
    )
  }

  render() {
    const { player, currentPlayer, properties } = this.props
    const { isListView, activeProperty, headerOffset } = this.state

    const fixedBalance = player.balance.toFixed()
      .replace(/(\d)(?=(\d{3})+$)/g, '$1,')

    return (
      <Container>
        <Header
            ref={this._getHeaderOffset}
            style={styles.header}>
          <Title style={styles.title}>
            {player === currentPlayer ? 'You' : player.name}
          </Title>

          <Text style={styles.balance}>
            <Icon name="currency"/>
            {fixedBalance}
          </Text>
        </Header>

        {isListView ? (
          <PropertyList
              style={styles.propertyList}
              properties={properties}
              index={activeProperty}
              offset={headerOffset}
              onChange={this.activateProperty}
              cardsToShow={4}
          />
        ) : (
          <View style={{ flex: 1 }}>
            <PropertyGrid
                properties={properties}
                onGroupPress={this.viewPropertyGroup}
            />

            {this.renderFooter()}
          </View>
        )}
      </Container>
    )
  }
}

const styles = {
  header: {
    alignItems: 'center'
  },
  title: {
    marginBottom: 10
  },
  balance: {
    fontSize: 24,
    color: 'rgb(100,200,100)',
    alignItems: 'center'
  },
  propertyList: {
    position: 'fixed',
    height: '100%',
    width: '100%',
    top: 0,
    left: 0
  }
}

export default Player
