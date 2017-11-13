import React, { Component } from 'react';
import PropTypes from 'prop-types';
import route from './route';

import { newGame } from '../redux/game';

import { Container, Section } from '../ui/layout';
import Title from '../ui/typography/title';
import Button from '../ui/button';
import Logo from '../ui/logo';

@route(({ app }) => ({
  room: app.room,
  loading: app.waiting.includes('game:created')
}), {
  newGame
})

class WelcomeScreen extends Component {
  static propTypes = {
    room: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    push: PropTypes.func.isRequired,
    newGame: PropTypes.func.isRequired
  };

  componentWillReceiveProps(nextProps) {
    let { room, push } = nextProps;

    if (room) {
      push(`/${room}/join`);
    }
  }

  newGame = () => {
    let { loading, newGame } = this.props;

    if (!loading) {
      newGame();
    }
  };

  render() {
    let { loading } = this.props;

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
