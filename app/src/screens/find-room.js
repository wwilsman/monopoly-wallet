import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useGame, useEmitter, useEmit } from '../api';

import { Container } from '../ui/layout';
import { Heading } from '../ui/typography';
import NavBar from '../ui/nav-bar';

import FindGameForm from '../game/find-game-form';

FindRoomScreen.propTypes = {
  push: PropTypes.func.isRequired
};

export default function FindRoomScreen({ push }) {
  let { room } = useGame();
  let { disconnect } = useEmitter();
  let [ connect, { pending, ok, error }] = useEmit('room:connect');

  let handleFindGame = useCallback(room => {
    if (!pending) connect(room.toLowerCase());
  }, [pending]);

  useEffect(() => void(room && disconnect()), []);
  useEffect(() => void(ok && push(`/${room}/join`)), [ok]);

  return (
    <Container data-test-find-room>
      <NavBar showBack>
        <Heading data-test-find-room-heading>
          Join Game
        </Heading>
      </NavBar>

      <FindGameForm
        loading={pending}
        error={error?.message}
        onSubmit={handleFindGame}
      />
    </Container>
  );
}
