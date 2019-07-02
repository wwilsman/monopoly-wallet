import React from 'react';
import PropTypes from 'prop-types';

import { useApp, useWaitingFor, usePrevious } from '../utils';
import { useGameActions } from '../redux/actions';

import { Container } from '../ui/layout';
import { Heading } from '../ui/typography';
import NavBar from '../ui/nav-bar';

import FindGameForm from '../game/find-game-form';

FindRoomScreen.propTypes = {
  push: PropTypes.func.isRequired
};

export default function FindRoomScreen({ push }) {
  let { room, error } = useApp();
  let { connectToGame, disconnectGame } = useGameActions();
  let connecting = useWaitingFor('room:connected');
  let prevRoom = usePrevious(room);

  if (room && prevRoom === '') {
    // successfully connected to a new room
    push(`/${room}/join`);
  } else if (room) {
    // already connected to a room
    disconnectGame(room);
  }

  return (
    <Container data-test-find-room>
      <NavBar showBack>
        <Heading data-test-find-room-heading>
          Join Game
        </Heading>
      </NavBar>

      <FindGameForm
        error={error}
        loading={connecting}
        onSubmit={connectToGame}
      />
    </Container>
  );
}
