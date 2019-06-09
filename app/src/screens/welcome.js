import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { useGameActions } from '../redux/actions';
import { useApp, useWaitingFor, usePrevious } from '../utils';

import { Container, Section } from '../ui/layout';
import Title from '../ui/typography/title';
import Button from '../ui/button';
import Logo from '../ui/logo';

WelcomeScreen.propTypes = {
  push: PropTypes.func.isRequired
};

export default function WelcomeScreen({ push }) {
  let { room } = useApp();
  let prevRoom = usePrevious(room);
  let loading = useWaitingFor('game:created');
  let { newGame, disconnectGame } = useGameActions();

  let handleNewGame = useCallback(() => {
    if (!loading) newGame();
  }, [loading, newGame]);

  if (room && prevRoom === '') {
    // successfully connected to a new room
    push(`/${room}/join`);
  } else if (room) {
    // already connected to a room
    disconnectGame(room);
  }

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
          style="secondary"
          loading={loading}
          onClick={handleNewGame}
          data-test-welcome-new-game-btn
        >
          New Game
        </Button>

        <Button
          style="primary"
          disabled={loading}
          linkTo="/join"
          data-test-welcome-join-game-btn
        >
          Join Game
        </Button>
      </Section>
    </Container>
  );
}
