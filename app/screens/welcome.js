import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import { newGame } from '../redux/game';

import { Container, Section } from '../ui/layout';
import Title from '../ui/typography/title';
import Button from '../ui/button';
import Logo from '../ui/logo';

@route(({ game }) => ({
  loading: game.loading
}), {
  newGame
})

class WelcomeScreen extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    newGame: PropTypes.func.isRequired
  };

  newGame = () => {
    this.props.newGame();
  };

  render() {
    const {
      loading
    } = this.props;

    return (
      <Container data-test-welcome>
        <Section align="center">
          <Logo/>
          <Title data-test-welcome-title>
            Monopoly<br/>Wallet
          </Title>
        </Section>

        <Section align="center" justify="center">
          <Button
              type="secondary"
              loading={loading}
              onClick={this.newGame}
              data-test-welcome-new-game-btn>
            New Game
          </Button>

          <Button
              type="primary"
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

export default WelcomeScreen;
