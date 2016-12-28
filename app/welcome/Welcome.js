import React, { Component, PropTypes } from 'react'

import { Container, Title, Centered } from '../layout'
import { View, Text, Button } from '../core/components'

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
        <Centered>
          <Title style={styles.welcome}>
            Monopoly Wallet
          </Title>

          <Button onClick={this.goToNewGame}>
            New Game
          </Button>
        </Centered>
      </Container>
    )
  }
}

const styles = {
  welcome: {
    fontSize: 36,
    marginBottom: 20
  }
}

export default Welcome
