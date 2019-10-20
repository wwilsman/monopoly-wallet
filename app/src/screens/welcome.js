import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useGame, useEmitter, useEmit } from '../api';

import { Container, Section } from '../ui/layout';
import Title from '../ui/typography/title';
import Button from '../ui/button';
import Logo from '../ui/logo';

WelcomeScreen.propTypes = {
  push: PropTypes.func.isRequired
};

export default function WelcomeScreen({ push }) {
  let { room } = useGame();
  let { disconnect } = useEmitter();
  let [ newGame, { pending, ok, data } ] = useEmit('room:create');
  let handleNewGame = useCallback(() => !pending && newGame(), [pending]);

  useEffect(() => void(room && disconnect()), []);
  useEffect(() => void(ok && push(`/${data[0].room}/join`)), [ok]);

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
          loading={pending}
          onClick={handleNewGame}
          data-test-welcome-new-game-btn
        >
          New Game
        </Button>

        <Button
          style="primary"
          disabled={pending}
          linkTo="/join"
          data-test-welcome-join-game-btn
        >
          Join Game
        </Button>
      </Section>
    </Container>
  );
}
