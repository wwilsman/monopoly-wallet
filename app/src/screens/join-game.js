import React from 'react';
import PropTypes from 'prop-types';

import { useGameActions } from '../redux/actions';
import { useApp, useWaitingFor, usePrevious } from '../utils';

import { Container, Section } from '../ui/layout';
import { Heading } from '../ui/typography';
import NavBar from '../ui/nav-bar';
import Spinner from '../ui/spinner';

import JoinGameForm from '../game/join-game-form';

JoinGameScreen.propTypes = {
  push: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
  params: PropTypes.shape({
    room: PropTypes.string
  }).isRequired
};

export default function JoinGameScreen({
  push,
  replace,
  params
}) {
  let { room, error, player } = useApp();
  let joining = useWaitingFor('game:joined');
  let connecting = useWaitingFor('room:connected');
  let prevJoining = usePrevious(joining);

  let {
    connectToGame,
    disconnectGame,
    joinGame
  } = useGameActions();

  if (!joining && prevJoining && player) {
    // if a player joined, send them to the game room
    push(`/${room}`, { player });
  } else if (room && (params.room !== room || prevJoining == null)) {
    // if we were connected to a different room
    disconnectGame();
  } else if (!connecting && !room) {
    // if not connecting or connected to the room, connect
    connectToGame(params.room);
  } else if (connecting && error) {
    // if we have an issue connecting, send them to find a room
    replace('/join');
  }

  return (
    <Container data-test-join-game>
      {connecting ? (
        <Section align="center" justify="center">
          <Spinner xl/>
        </Section>
      ) : (
        <>
          <NavBar showBack roomCode={params.room}>
            <Heading data-test-join-game-heading>
              Join Game
            </Heading>
          </NavBar>

          <JoinGameForm
            error={error}
            loading={joining}
            onSubmit={joinGame}
          />
        </>
      )}
    </Container>
  );
}