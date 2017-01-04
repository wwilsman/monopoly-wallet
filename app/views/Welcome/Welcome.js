import React, { Component, PropTypes } from 'react'
import s from './Welcome.scss'

import { View, Text, Container, Button } from '../../common'

class Welcome extends Component {
  static contextTypes = {
    router: PropTypes.object
  }

  goToNewGame = () => {
    const { router } = this.context
    router.transitionTo({ pathname: '/new' })
  }

  render() {
    return (
      <Container>
        <View className={s.root}>
          <Text className={s.title}>
            Monopoly Wallet
          </Text>

          <Button onClick={this.goToNewGame}>
            New Game
          </Button>
        </View>
      </Container>
    )
  }
}

export default Welcome
