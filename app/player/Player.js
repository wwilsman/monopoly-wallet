import React, { Component, PropTypes } from 'react'
import { StyleSheet } from 'react-native'

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

export default class Player extends Component {

  render() {
    let { player } = this.props

    if (!player) {
      return null
    }

    return (
      <Container>
        <Header>
          <Title>
            <Icon style={styles.playerIcon}
              name={player.token}/>
            {player.name}
          </Title>
        </Header>

        <Content>
          <PlayerBalance balance={player.balance}/>

        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  playerIcon: {
    marginRight: 15
  }
})
