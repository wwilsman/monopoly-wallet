import React, { Component } from 'react';
import { connect } from 'react-redux';

import { newGame } from '../actions/game';

import { Container, Section } from '../ui/layout';
import Text from '../ui/text';
import Button from '../ui/button';

@connect(({ game }) => ({
  loading: game.loading
}), {
  newGame
})

class Welcome extends Component {
  newGame = () => {
    this.props.newGame();
  };

  render() {
    const {
      loading
    } = this.props;

    return (
      <Container>
        <Section justify="center">
          <Text h1 center>
            Monopoly<br/>Wallet
          </Text>
        </Section>

        <Section align="center">
          <Button
              color="green"
              loading={loading}
              onClick={this.newGame}
              data-test-welcome-new-game-btn>
            New Game
          </Button>

          <Button
              color="blue"
              disabled={loading}
              linkTo="/join"
              data-test-welcome-join-game-btn>
            Join Game
          </Button>
        </Section>
      </Container>
    );
  }
}

export default Welcome;
